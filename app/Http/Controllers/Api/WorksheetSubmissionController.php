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
        abort_if($worksheetAssignment->status === 'checked', 409, 'Checked assignments cannot be resubmitted.');

        if ($user->hasRole('parent')) {
            abort_unless($user->parentProfile?->students()->whereKey($worksheetAssignment->student_id)->exists(), 403);
        }

        $file = $request->file('file');
        $path = $file->store('submissions');
        $oldPath = $worksheetAssignment->submission?->file_path;

        try {
            $submission = DB::transaction(function () use ($request, $worksheetAssignment, $file, $path, $user) {
                $submission = WorksheetSubmission::updateOrCreate(
                    ['assignment_id' => $worksheetAssignment->id],
                    [
                        'uploaded_by' => $user->id,
                        'file_path' => $path,
                        'original_filename' => $file->getClientOriginalName(),
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize(),
                        'student_note' => $request->validated('student_note'),
                        'submitted_at' => now(),
                    ]
                );

                $worksheetAssignment->update(['status' => 'submitted']);

                return $submission;
            });
        } catch (\Throwable $exception) {
            Storage::delete($path);
            throw $exception;
        }

        if ($oldPath && $oldPath !== $path) {
            Storage::delete($oldPath);
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
            || ($user->hasRole('teacher') && $assignment->worksheet->teacher_id === $user->teacherProfile?->id);
        abort_unless($allowed, 403);
    }
}
