<?php

namespace App\Services;

use App\Models\PerformanceReport;
use App\Models\TeacherProfile;
use App\Models\TeacherReview;
use App\Models\WorksheetSubmission;
use Illuminate\Support\Facades\DB;

class ManualReviewService
{
    public function save(WorksheetSubmission $submission, TeacherProfile $teacher, array $data): TeacherReview
    {
        return DB::transaction(function () use ($submission, $teacher, $data) {
            $isChecked = $data['status'] === 'checked';
            $percentage = $isChecked
                ? round(((float) $data['obtained_marks'] / (float) $data['total_marks']) * 100, 2)
                : null;

            $review = TeacherReview::updateOrCreate(
                ['submission_id' => $submission->id],
                [
                    'teacher_id' => $teacher->id,
                    'obtained_marks' => $isChecked ? $data['obtained_marks'] : null,
                    'total_marks' => $isChecked ? $data['total_marks'] : null,
                    'percentage' => $percentage,
                    'remarks' => $data['remarks'] ?? null,
                    'status' => $data['status'],
                    'checked_at' => $isChecked ? now() : null,
                ]
            );

            $assignment = $submission->assignment;
            if ($assignment->submission()->whereKey($submission->id)->exists()) {
                $assignment->update(['status' => $isChecked ? 'checked' : 'submitted']);
            }

            if ($isChecked) {
                PerformanceReport::updateOrCreate(
                    ['review_id' => $review->id],
                    [
                        'student_id' => $assignment->student_id,
                        'overall_grade' => $this->grade($percentage),
                        'progress' => $percentage,
                        'teacher_comment' => $data['teacher_comment'] ?? $data['remarks'] ?? null,
                    ]
                );
            } else {
                $review->report()?->delete();
            }

            return $review->fresh([
                'teacher.user',
                'submission.assignment.worksheet',
                'submission.assignment.student.user',
                'report',
            ]);
        });
    }

    private function grade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'A+',
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'D',
            default => 'F',
        };
    }
}
