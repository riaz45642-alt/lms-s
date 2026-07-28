<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeacherReviewRequest;
use App\Models\TeacherReview;
use App\Models\WorksheetSubmission;
use App\Services\ManualReviewService;
use Illuminate\Http\Request;

class TeacherReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = TeacherReview::with([
            'teacher.user',
            'submission.assignment.worksheet',
            'submission.assignment.student.user',
            'report',
        ]);

        if ($request->user()->hasRole('teacher')) {
            $query->where('teacher_id', $request->user()->teacherProfile?->id);
        }

        return $query
            ->when($request->string('status')->toString(), fn ($q, $status) => $q->where('status', $status))
            ->latest()
            ->paginate(20);
    }

    public function store(StoreTeacherReviewRequest $request, WorksheetSubmission $worksheetSubmission, ManualReviewService $service)
    {
        $teacher = $request->user()->teacherProfile;
        abort_unless($teacher, 422, 'A teacher profile is required.');
        abort_unless(
            $worksheetSubmission->assignment->worksheet->teacher_id === $teacher->id,
            403,
            'Only the worksheet owner can review this submission.'
        );

        $review = $service->save($worksheetSubmission, $teacher, $request->validated());

        return response()->json($review, $review->wasRecentlyCreated ? 201 : 200);
    }

    public function show(Request $request, TeacherReview $teacherReview)
    {
        $user = $request->user();
        $studentId = $teacherReview->submission->assignment->student_id;
        $allowed = $user->hasRole('admin')
            || ($user->hasRole('teacher') && $teacherReview->teacher_id === $user->teacherProfile?->id)
            || ($user->hasRole('student') && $studentId === $user->studentProfile?->id)
            || ($user->hasRole('parent') && $user->parentProfile?->students()->whereKey($studentId)->exists());
        abort_unless($allowed, 403);

        return $teacherReview->load('teacher.user', 'submission.assignment.worksheet', 'submission.assignment.student.user', 'report');
    }
}
