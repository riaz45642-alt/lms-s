<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use App\Models\Permission;
use App\Models\Role;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Models\Worksheet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    private const ROLES = ['admin', 'teacher', 'parent', 'student'];
    private const SUBSCRIPTION_STATUSES = ['pending', 'active', 'expired', 'cancelled', 'rejected'];

    public function overview(Request $request)
    {
        $this->admin($request);
        $now = now();
        $pendingReviews = DB::table('teacher_reviews')->where('status', 'pending')->count();
        $pendingSubscriptions = DB::table('billing_interests')->where('status', 'pending')->count();
        return [
            'counts' => [
                'users' => User::withTrashed()->count(),
                'active_users' => User::where('status', 'active')->count(),
                'suspended_users' => User::where('status', 'suspended')->count(),
                'teachers' => User::where('role', 'teacher')->count(),
                'students' => User::where('role', 'student')->count(),
                'worksheets' => Worksheet::count(),
                'published_worksheets' => Worksheet::where('is_published', true)->count(),
                'draft_worksheets' => Worksheet::where('is_published', false)->count(),
                'subjects' => Subject::count(),
                'events' => DB::table('calendar_events')->count(),
                'active_subscriptions' => DB::table('subscriptions')->where('status', 'active')->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now))->count(),
                'expired_subscriptions' => DB::table('subscriptions')->where(fn ($q) => $q->where('status', 'expired')->orWhere('ends_at', '<=', $now))->count(),
                'pending_subscriptions' => $pendingSubscriptions,
            ],
            'recent_users' => User::latest()->limit(6)->get(['id', 'name', 'email', 'role', 'status', 'created_at']),
            'recent_worksheets' => Worksheet::with('creator:id,name')->latest()->limit(6)->get(['id', 'created_by', 'title', 'subject', 'is_published', 'created_at']),
            'recent_subscriptions' => $this->subscriptionQuery()->latest('subscriptions.updated_at')->limit(6)->get(),
            'recent_activity' => $this->auditQuery()->limit(8)->get(),
            'pending_actions' => [
                ['label' => 'Subscription requests', 'count' => $pendingSubscriptions, 'section' => 'subscriptions'],
                ['label' => 'Pending teacher reviews', 'count' => $pendingReviews, 'section' => 'reports'],
                ['label' => 'Draft worksheets', 'count' => Worksheet::where('is_published', false)->count(), 'section' => 'worksheets'],
            ],
            'alerts' => $request->user()->notifications()->latest()->limit(6)->get(),
        ];
    }

    public function users(Request $request)
    {
        $this->admin($request);
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:255'], 'role' => ['nullable', Rule::in(self::ROLES)],
            'status' => ['nullable', Rule::in(['active', 'suspended', 'deleted'])],
            'subscription_status' => ['nullable', Rule::in(self::SUBSCRIPTION_STATUSES)],
            'sort' => ['nullable', Rule::in(['newest', 'oldest', 'name', 'email'])], 'page' => ['nullable', 'integer', 'min:1'],
        ]);
        $query = User::query()->with(['roles.permissions:id,name,slug,group', 'parentProfile:id,user_id,phone', 'teacherProfile:id,user_id,employee_number,specialization', 'studentProfile.schoolClass:id,name,code,grade_level']);
        if (($data['status'] ?? null) === 'deleted') $query->onlyTrashed(); else $query->when($data['status'] ?? null, fn ($q, $v) => $q->where('status', $v));
        $query->when($data['q'] ?? null, fn ($q, $v) => $q->where(fn ($s) => $s->where('name', 'like', "%$v%")->orWhere('email', 'like', "%$v%")->orWhere('id', $v)))
            ->when($data['role'] ?? null, fn ($q, $v) => $q->where('role', $v))
            ->when($data['subscription_status'] ?? null, fn ($q, $v) => $q->whereExists(fn ($s) => $s->selectRaw('1')->from('subscriptions')->whereColumn('subscriptions.user_id', 'users.id')->where('subscriptions.status', $v)));
        match ($data['sort'] ?? 'newest') {
            'oldest' => $query->oldest(), 'name' => $query->orderBy('name'), 'email' => $query->orderBy('email'), default => $query->latest(),
        };
        $page = $query->paginate(20);
        $subscriptionMap = $this->subscriptionQuery()->whereIn('subscriptions.user_id', collect($page->items())->pluck('id'))->latest('subscriptions.updated_at')->get()->unique('user_id')->keyBy('user_id');
        $page->getCollection()->transform(function ($user) use ($subscriptionMap) { $user->current_subscription = $subscriptionMap->get($user->id); return $user; });
        return $page;
    }

    public function showUser(Request $request, int $id)
    {
        $this->admin($request);
        $user = User::withTrashed()->with(['roles.permissions', 'parentProfile.students.user:id,name,email', 'teacherProfile.students.user:id,name,email', 'studentProfile.parent.user:id,name,email', 'studentProfile.teachers.user:id,name,email', 'studentProfile.schoolClass'])->findOrFail($id);
        $user->subscriptions = $this->subscriptionQuery()->where('subscriptions.user_id', $id)->latest('subscriptions.updated_at')->get();
        $user->activity = DB::table('activity_log')->where('user_id', $id)->latest()->limit(20)->get();
        return $user;
    }

    public function storeUser(Request $request)
    {
        $this->admin($request);
        $data = $this->validateUser($request, null, true);
        $user = DB::transaction(function () use ($request, $data) {
            $user = User::create(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password'], 'role' => $data['role'], 'status' => $data['status'] ?? 'active', 'email_verified_at' => !empty($data['email_verified']) ? now() : null]);
            $this->syncProfile($user, $data);
            $this->audit($request, 'user.created', 'user', $user->id, $user->email, ['role' => $user->role]);
            return $user;
        });
        return response()->json($user->load('roles.permissions'), 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $this->admin($request);
        $data = $this->validateUser($request, $user, false);
        if ($user->is($request->user()) && (($data['status'] ?? null) === 'suspended' || (isset($data['role']) && $data['role'] !== 'admin'))) throw ValidationException::withMessages(['role' => ['You cannot remove your own active admin access.']]);
        $before = $user->only(['name', 'email', 'role', 'status']);
        DB::transaction(function () use ($request, $user, $data, $before) {
            $user->update(array_filter(['name' => $data['name'] ?? null, 'email' => $data['email'] ?? null, 'password' => $data['password'] ?? null, 'role' => $data['role'] ?? null, 'status' => $data['status'] ?? null], fn ($v) => $v !== null && $v !== ''));
            if (array_key_exists('email_verified', $data)) $user->forceFill(['email_verified_at' => $data['email_verified'] ? ($user->email_verified_at ?? now()) : null])->save();
            $this->syncProfile($user, $data);
            if (isset($data['role']) && $data['role'] !== $before['role']) { $user->roles()->sync([]); $user->assignRole($data['role'], $request->user()); }
            $action = isset($data['role']) && $data['role'] !== $before['role'] ? 'user.role_changed' : (isset($data['status']) && $data['status'] !== $before['status'] ? ($data['status'] === 'suspended' ? 'user.suspended' : 'user.reactivated') : 'user.updated');
            $this->audit($request, $action, 'user', $user->id, $user->email, ['before' => $before, 'after' => $user->fresh()->only(['name', 'email', 'role', 'status'])]);
        });
        if (isset($data['role']) || isset($data['status'])) $user->tokens()->delete();
        return $this->showUser($request, $user->id);
    }

    public function destroyUser(Request $request, User $user)
    {
        $this->admin($request);
        abort_if($user->is($request->user()), 422, 'You cannot delete your own account.');
        $label = $user->email; $user->tokens()->delete(); $user->delete();
        $this->audit($request, 'user.deleted', 'user', $user->id, $label);
        return response()->noContent();
    }

    public function restoreUser(Request $request, int $id)
    {
        $this->admin($request); $user = User::onlyTrashed()->findOrFail($id); $user->restore();
        $this->audit($request, 'user.restored', 'user', $user->id, $user->email);
        return $user;
    }

    public function roles(Request $request)
    {
        $this->admin($request);
        return Role::with('permissions:id,name,slug,group,description')->withCount('users')->orderByDesc('priority')->get();
    }

    public function updateRolePermissions(Request $request, Role $role)
    {
        $this->admin($request);
        $data = $request->validate(['permission_ids' => ['required', 'array'], 'permission_ids.*' => ['integer', 'distinct', 'exists:permissions,id']]);
        if ($role->slug === 'admin') {
            $critical = Permission::whereIn('slug', ['users.manage', 'rbac.manage'])->pluck('id');
            abort_unless($critical->diff($data['permission_ids'])->isEmpty(), 422, 'The Admin role must retain critical administration permissions.');
        }
        $role->permissions()->sync($data['permission_ids']);
        $this->audit($request, 'role.permissions_updated', 'role', $role->id, $role->name, ['permission_ids' => $data['permission_ids']]);
        return $role->load('permissions');
    }

    public function subscriptions(Request $request)
    {
        $this->admin($request);
        $data = $request->validate(['q' => ['nullable', 'string', 'max:255'], 'status' => ['nullable', Rule::in(self::SUBSCRIPTION_STATUSES)], 'page' => ['nullable', 'integer', 'min:1']]);
        return $this->subscriptionQuery()->when($data['q'] ?? null, fn ($q, $v) => $q->where(fn ($s) => $s->where('users.name', 'like', "%$v%")->orWhere('users.email', 'like', "%$v%")->orWhere('subscriptions.id', $v)))
            ->when($data['status'] ?? null, fn ($q, $v) => $q->where('subscriptions.status', $v))->latest('subscriptions.updated_at')->paginate(20);
    }

    public function subscriptionRequests(Request $request)
    {
        $this->admin($request);
        return DB::table('billing_interests')->join('users', 'users.id', '=', 'billing_interests.user_id')->join('billing_plans', 'billing_plans.id', '=', 'billing_interests.billing_plan_id')
            ->select('billing_interests.*', 'users.name as user_name', 'users.email as user_email', 'billing_plans.name as plan_name', 'billing_plans.interval', 'billing_plans.price_cents', 'billing_plans.currency')->latest('billing_interests.created_at')->paginate(20);
    }

    public function updateSubscriptionRequest(Request $request, int $id)
    {
        $this->admin($request); $data = $request->validate(['action' => ['required', Rule::in(['approve', 'reject'])], 'ends_at' => ['nullable', 'date', 'after:now'], 'notes' => ['nullable', 'string', 'max:2000']]);
        $interest = DB::table('billing_interests')->find($id); abort_unless($interest, 404); abort_unless($interest->status === 'pending', 409, 'This request has already been processed.');
        return DB::transaction(function () use ($request, $data, $interest) {
            if ($data['action'] === 'reject') { DB::table('billing_interests')->where('id', $interest->id)->update(['status' => 'rejected', 'updated_at' => now()]); $this->audit($request, 'subscription.rejected', 'billing_interest', $interest->id, null); return response()->json(['status' => 'rejected']); }
            $subscriptionId = DB::table('subscriptions')->insertGetId(['user_id' => $interest->user_id, 'billing_plan_id' => $interest->billing_plan_id, 'billing_interest_id' => $interest->id, 'status' => 'active', 'starts_at' => now(), 'ends_at' => $data['ends_at'] ?? now()->addMonth(), 'created_by' => $request->user()->id, 'updated_by' => $request->user()->id, 'admin_notes' => $data['notes'] ?? null, 'created_at' => now(), 'updated_at' => now()]);
            DB::table('billing_interests')->where('id', $interest->id)->update(['status' => 'approved', 'updated_at' => now()]);
            $this->audit($request, 'subscription.approved', 'subscription', $subscriptionId, null);
            return response()->json(DB::table('subscriptions')->find($subscriptionId), 201);
        });
    }

    public function updateSubscription(Request $request, int $id)
    {
        $this->admin($request); $subscription = DB::table('subscriptions')->find($id); abort_unless($subscription, 404);
        $data = $request->validate(['action' => ['required', Rule::in(['activate', 'renew', 'extend', 'cancel', 'expire'])], 'ends_at' => ['nullable', 'date', 'after:now'], 'days' => ['nullable', 'integer', 'min:1', 'max:3650'], 'notes' => ['nullable', 'string', 'max:2000']]);
        $updates = ['updated_by' => $request->user()->id, 'updated_at' => now(), 'admin_notes' => $data['notes'] ?? $subscription->admin_notes];
        if ($data['action'] === 'cancel') $updates += ['status' => 'cancelled', 'cancelled_at' => now()];
        elseif ($data['action'] === 'expire') $updates += ['status' => 'expired', 'ends_at' => now()];
        elseif ($data['action'] === 'activate') $updates += ['status' => 'active', 'starts_at' => $subscription->starts_at ?? now(), 'ends_at' => $data['ends_at'] ?? now()->addMonth(), 'cancelled_at' => null];
        else { $base = $subscription->ends_at && now()->lt($subscription->ends_at) ? \Carbon\Carbon::parse($subscription->ends_at) : now(); $updates += ['status' => 'active', 'ends_at' => $data['ends_at'] ?? $base->copy()->addDays($data['days'] ?? 30), 'cancelled_at' => null]; }
        DB::table('subscriptions')->where('id', $id)->update($updates);
        $this->audit($request, "subscription.{$data['action']}", 'subscription', $id, null, $updates);
        return DB::table('subscriptions')->find($id);
    }

    public function subjects(Request $request)
    {
        $this->admin($request); $data = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'status' => ['nullable', Rule::in(['active', 'inactive'])]]);
        return Subject::withCount(['teachingAssignments'])->when($data['q'] ?? null, fn ($q, $v) => $q->where(fn ($s) => $s->where('name', 'like', "%$v%")->orWhere('code', 'like', "%$v%")))
            ->when($data['status'] ?? null, fn ($q, $v) => $q->where('is_active', $v === 'active'))->orderBy('name')->paginate(20);
    }

    public function updateSubject(Request $request, Subject $subject)
    {
        $this->admin($request); $data = $request->validate(['name' => ['sometimes', 'required', 'string', 'max:100'], 'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('subjects')->ignore($subject)], 'description' => ['nullable', 'string', 'max:2000'], 'is_active' => ['sometimes', 'boolean']]); $subject->update($data); $this->audit($request, 'subject.updated', 'subject', $subject->id, $subject->name); return $subject;
    }

    public function destroySubject(Request $request, Subject $subject)
    {
        $this->admin($request); abort_if($subject->teachingAssignments()->exists(), 409, 'Subjects assigned to classes cannot be deleted. Deactivate this subject instead.'); $label = $subject->name; $subject->delete(); $this->audit($request, 'subject.deleted', 'subject', $subject->id, $label); return response()->noContent();
    }

    public function events(Request $request)
    {
        $this->admin($request); $data = $request->validate(['q' => ['nullable', 'string', 'max:100'], 'status' => ['nullable', Rule::in(['scheduled', 'cancelled', 'completed'])]]);
        return DB::table('calendar_events')->leftJoin('users', 'users.id', '=', 'calendar_events.created_by')->leftJoin('classes', 'classes.id', '=', 'calendar_events.class_id')->select('calendar_events.*', 'users.name as creator_name', 'classes.name as class_name')->when($data['q'] ?? null, fn ($q, $v) => $q->where('calendar_events.title', 'like', "%$v%"))->when($data['status'] ?? null, fn ($q, $v) => $q->where('calendar_events.status', $v))->latest('starts_at')->paginate(20);
    }

    public function storeEvent(Request $request)
    {
        $this->admin($request); $data = $request->validate(['title' => ['required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'class_id' => ['nullable', 'exists:classes,id'], 'event_type' => ['required', Rule::in(['class', 'assignment', 'deadline', 'event'])], 'starts_at' => ['required', 'date'], 'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'], 'is_published' => ['sometimes', 'boolean'], 'status' => ['sometimes', Rule::in(['scheduled', 'cancelled', 'completed'])]]); $id = DB::table('calendar_events')->insertGetId($data + ['created_by' => $request->user()->id, 'created_at' => now(), 'updated_at' => now()]); $this->audit($request, 'event.created', 'event', $id, $data['title']); return response()->json(DB::table('calendar_events')->find($id), 201);
    }

    public function updateEvent(Request $request, int $id)
    {
        $this->admin($request); abort_unless(DB::table('calendar_events')->find($id), 404); $data = $request->validate(['title' => ['sometimes', 'required', 'string', 'max:255'], 'description' => ['nullable', 'string'], 'class_id' => ['nullable', 'exists:classes,id'], 'event_type' => ['sometimes', Rule::in(['class', 'assignment', 'deadline', 'event'])], 'starts_at' => ['sometimes', 'date'], 'ends_at' => ['nullable', 'date'], 'is_published' => ['sometimes', 'boolean'], 'status' => ['sometimes', Rule::in(['scheduled', 'cancelled', 'completed'])]]); DB::table('calendar_events')->where('id', $id)->update($data + ['updated_at' => now()]); $event = DB::table('calendar_events')->find($id); $this->audit($request, 'event.updated', 'event', $id, $event->title); return $event;
    }

    public function destroyEvent(Request $request, int $id)
    {
        $this->admin($request); $event = DB::table('calendar_events')->find($id); abort_unless($event, 404); DB::table('calendar_events')->delete($id); $this->audit($request, 'event.deleted', 'event', $id, $event->title); return response()->noContent();
    }

    public function auditLogs(Request $request) { $this->admin($request); return $this->auditQuery()->paginate(30); }

    public function system(Request $request)
    {
        $this->admin($request);
        $worksheetBytes = Worksheet::sum('file_size');
        return ['status' => 'healthy', 'application' => config('app.name', 'EduSphere'), 'environment' => app()->environment(), 'framework' => app()->version(), 'php' => PHP_VERSION, 'database' => DB::connection()->getDriverName(), 'counts' => ['users' => User::withTrashed()->count(), 'worksheets' => Worksheet::count(), 'subscriptions' => DB::table('subscriptions')->count(), 'subjects' => Subject::count(), 'events' => DB::table('calendar_events')->count()], 'storage' => ['worksheet_files' => Worksheet::count(), 'worksheet_bytes' => (int) $worksheetBytes], 'checked_at' => now()];
    }

    private function validateUser(Request $request, ?User $user, bool $creating): array
    {
        return $request->validate([
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:255'], 'email' => [$creating ? 'required' : 'sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'password' => [$creating ? 'required' : 'nullable', 'string', 'min:8'], 'role' => [$creating ? 'required' : 'sometimes', Rule::in(self::ROLES)], 'status' => ['sometimes', Rule::in(['active', 'suspended'])], 'email_verified' => ['sometimes', 'boolean'],
            'phone' => ['nullable', 'string', 'max:30'], 'specialization' => ['nullable', 'string', 'max:255'], 'grade_level' => ['nullable', 'string', 'max:50'], 'date_of_birth' => ['nullable', 'date', 'before:today'],
        ]);
    }

    private function syncProfile(User $user, array $data): void
    {
        match ($data['role'] ?? $user->role) {
            'parent' => ParentProfile::updateOrCreate(['user_id' => $user->id], ['phone' => $data['phone'] ?? $user->parentProfile?->phone]),
            'teacher' => TeacherProfile::updateOrCreate(['user_id' => $user->id], ['specialization' => $data['specialization'] ?? $user->teacherProfile?->specialization]),
            'student' => StudentProfile::updateOrCreate(['user_id' => $user->id], ['grade_level' => $data['grade_level'] ?? $user->studentProfile?->grade_level, 'date_of_birth' => $data['date_of_birth'] ?? $user->studentProfile?->date_of_birth]), default => null,
        };
    }

    private function subscriptionQuery()
    {
        return DB::table('subscriptions')->join('users', 'users.id', '=', 'subscriptions.user_id')->join('billing_plans', 'billing_plans.id', '=', 'subscriptions.billing_plan_id')->select('subscriptions.*', 'users.name as user_name', 'users.email as user_email', 'billing_plans.name as plan_name', 'billing_plans.price_cents', 'billing_plans.currency', 'billing_plans.interval');
    }

    private function auditQuery()
    {
        return DB::table('admin_audit_logs')->leftJoin('users', 'users.id', '=', 'admin_audit_logs.actor_id')->select('admin_audit_logs.*', 'users.name as actor_name')->latest('admin_audit_logs.created_at');
    }

    private function audit(Request $request, string $action, ?string $type, ?int $id, ?string $label, array $details = []): void
    {
        DB::table('admin_audit_logs')->insert(['actor_id' => $request->user()->id, 'action' => $action, 'target_type' => $type, 'target_id' => $id, 'target_label' => $label, 'details' => $details ? json_encode($details) : null, 'ip_address' => $request->ip(), 'created_at' => now(), 'updated_at' => now()]);
    }

    private function admin(Request $request): void
    {
        abort_unless($request->user()?->hasRole('admin') && $request->user()->hasPermission('users.manage'), 403);
    }
}
