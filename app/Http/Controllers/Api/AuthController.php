<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParentProfile;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use App\Services\AdminEventService;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['required', Rule::in(['parent', 'teacher', 'student'])],
            'grade_level' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'phone' => ['nullable', 'string', 'max:30'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:parent_profiles,id'],
            'teacher_id' => ['nullable', 'integer', 'exists:teacher_profiles,id'],
        ]);

        if ($data['role'] !== 'student' && (isset($data['parent_id']) || isset($data['teacher_id']))) {
            throw ValidationException::withMessages([
                'role' => ['Parent ID and Teacher ID can only be used when registering a student.'],
            ]);
        }

        $user = DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => $data['role'],
            ]);

            match ($data['role']) {
                'parent' => ParentProfile::create(['user_id' => $user->id, 'phone' => $data['phone'] ?? null]),
                'teacher' => TeacherProfile::create(['user_id' => $user->id, 'specialization' => $data['specialization'] ?? null]),
                'student' => StudentProfile::create([
                    'user_id' => $user->id,
                    'parent_id' => $data['parent_id'] ?? null,
                    'grade_level' => $data['grade_level'] ?? null,
                    'date_of_birth' => $data['date_of_birth'] ?? null,
                ]),
            };

            if ($data['role'] === 'student' && isset($data['teacher_id'])) {
                $user->studentProfile->teachers()->attach($data['teacher_id']);
            }

            return $user;
        });

        event(new Registered($user));
        app(AdminEventService::class)->notifyAdmins('user.registered', 'New user registration', "{$user->name} registered as {$user->role}.", 'user', $user->id);

        return response()->json($this->tokenPayload($user), 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages(['email' => ['The supplied credentials are invalid.']]);
        }

        if ($user->status === 'suspended') {
            abort(403, 'This account is suspended.');
        }

        return response()->json($this->tokenPayload($user));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    private function tokenPayload(User $user): array
    {
        return [
            'token' => $user->createToken('lms-web')->plainTextToken,
            'portal_path' => $user->portalPath(),
            'user' => $user->load(
                'roles.permissions',
                'parentProfile',
                'teacherProfile',
                'studentProfile.parent.user',
                'studentProfile.teachers.user',
                'studentProfile.schoolClass'
            ),
        ];
    }
}
