<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSubmissionRequest;
use App\Models\WorksheetAssignment;
use App\Models\WorksheetSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class WorksheetSubmissionController extends Controller
{
    public function store(StoreSubmissionRequest $request, WorksheetAssignment $worksheetAssignment)
    {
        $user = $request->user();

        if ($user->hasRole('parent')) {
            abort_unless($user->parentProfile?->students()->whereKey($worksheetAssignment->student_id)->exists(), 403);
        } elseif ($user->hasRole('student')) {
            abort_unless($user->studentProfile?->id === $worksheetAssignment->student_id, 403);
        }

        abort_if(
            $worksheetAssignment->due_at?->isPast() && ! $worksheetAssignment->allow_late_submission,
            409,
            'The submission deadline has passed.'
        );
        abort_if(
            $worksheetAssignment->submission && ! $worksheetAssignment->allow_resubmission,
            409,
            'This assignment has already been submitted and resubmission is not allowed.'
        );

        $file = $request->file('file');
        $path = $file->store('submissions');

        try {
            $submission = DB::transaction(function () use ($request, $worksheetAssignment, $file, $path, $user) {
                $assignment = WorksheetAssignment::query()->lockForUpdate()->findOrFail($worksheetAssignment->id);
                $latestAttempt = WorksheetSubmission::where('assignment_id', $assignment->id)->max('attempt_number');
                abort_if($latestAttempt && ! $assignment->allow_resubmission, 409, 'Resubmission is not allowed.');
                abort_if($assignment->due_at?->isPast() && ! $assignment->allow_late_submission, 409, 'The submission deadline has passed.');

                $submission = WorksheetSubmission::create([
                    'assignment_id' => $assignment->id,
                    'attempt_number' => ($latestAttempt ?? 0) + 1,
                    'uploaded_by' => $user->id,
                    'file_path' => $path,
                    'original_filename' => $file->getClientOriginalName(),
                    'mime_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                    'student_note' => $request->validated('student_note'),
                    'submitted_at' => now(),
                ]);

                $assignment->update(['status' => 'submitted']);

                return $submission;
            });
        } catch (\Throwable $exception) {
            Storage::delete($path);
            throw $exception;
        }

        return response()->json($submission->load('assignment.worksheet', 'uploader', 'review.report'), 201);
    }

    public function show(Request $request, WorksheetSubmission $worksheetSubmission)
    {
        $this->authorizeAccess($request, $worksheetSubmission);

        return $worksheetSubmission->load('assignment.worksheet', 'assignment.student.user', 'uploader', 'review.teacher.user', 'review.report');
    }

    public function download(Request $request, WorksheetSubmission $worksheetSubmission)
    {
        $this->authorizeAccess($request, $worksheetSubmission);
        abort_unless(Storage::exists($worksheetSubmission->file_path), 404);

        return Storage::download($worksheetSubmission->file_path, $worksheetSubmission->original_filename);
    }

    private function authorizeAccess(Request $request, WorksheetSubmission $worksheetSubmission): void
    {
        $assignment = $worksheetSubmission->assignment;
        $user = $request->user();
        $allowed = $user->hasRole('admin')
            || ($user->hasRole('student') && $assignment->student_id === $user->studentProfile?->id)
            || ($user->hasRole('parent') && $user->parentProfile?->students()->whereKey($assignment->student_id)->exists())
            || ($user->hasRole('teacher') && $user->teacherProfile?->students()->whereKey($assignment->student_id)->exists());
        abort_unless($allowed, 403);
    }
}
