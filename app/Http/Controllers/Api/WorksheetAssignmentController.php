<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssignmentRequest;
use App\Models\StudentProfile;
use App\Models\Worksheet;
use App\Models\WorksheetAssignment;
use Illuminate\Http\Request;

class WorksheetAssignmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = WorksheetAssignment::with([
            'worksheet.creator',
            'student.user',
            'assigner',
            'submission.review.report',
            'submissions.uploader',
            'submissions.review.report',
        ]);

        if ($user->hasRole('student')) {
            $query->where('student_id', $user->studentProfile?->id);
        } elseif ($user->hasRole('parent')) {
            $query->whereIn('student_id', $user->parentProfile?->students()->pluck('student_profiles.id') ?? []);
        } elseif ($user->hasRole('teacher')) {
            $query->whereHas('student.teachers', fn ($q) => $q->whereKey($user->teacherProfile?->id));
        }

        return $query
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest('assigned_at')
            ->paginate(20);
    }

    public function store(StoreAssignmentRequest $request)
    {
        $user = $request->user();
        $student = StudentProfile::findOrFail($request->integer('student_id'));
        $worksheet = Worksheet::findOrFail($request->integer('worksheet_id'));

        if ($user->hasRole('parent')) {
            abort_unless($user->parentProfile?->students()->whereKey($student->id)->exists(), 403, 'This student is not linked to your account.');
            abort_unless($worksheet->is_published, 422, 'Parents can assign only published worksheets.');
        }

        $data = $request->validated();
        if (empty($data['due_at']) && $worksheet->default_due_days) {
            $data['due_at'] = now()->addDays($worksheet->default_due_days);
        }

        $assignment = WorksheetAssignment::create([
            ...$data,
            'assigned_by' => $user->id,
            'assigned_at' => now(),
            'status' => 'assigned',
        ]);

        return response()->json($assignment->load('worksheet', 'student.user', 'assigner'), 201);
    }

    public function show(Request $request, WorksheetAssignment $worksheetAssignment)
    {
        $this->authorizeAccess($request, $worksheetAssignment);

        return $worksheetAssignment->load(
            'worksheet.creator',
            'student.user',
            'assigner',
            'submission.review.report',
            'submissions.uploader',
            'submissions.review.report'
        );
    }

    private function authorizeAccess(Request $request, WorksheetAssignment $assignment): void
    {
        $user = $request->user();
        $allowed = $user->hasRole('admin')
            || ($user->hasRole('student') && $assignment->student_id === $user->studentProfile?->id)
            || ($user->hasRole('parent') && $user->parentProfile?->students()->whereKey($assignment->student_id)->exists())
            || ($user->hasRole('teacher') && $user->teacherProfile?->students()->whereKey($assignment->student_id)->exists());

        abort_unless($allowed, 403);
    }
}
