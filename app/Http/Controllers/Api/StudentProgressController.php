<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class StudentProgressController extends Controller
{
    public function __invoke(Request $request, StudentProfile $student)
    {
        $user = $request->user();
        $allowed = $user->hasRole('admin')
            || ($user->hasRole('student') && $user->studentProfile?->is($student))
            || ($user->hasRole('parent') && $student->parent_id === $user->parentProfile?->id)
            || ($user->hasRole('teacher') && $student->teachers()->whereKey($user->teacherProfile?->id)->exists());
        abort_unless($allowed, 403);

        $assignments = $student->assignments()
            ->with('worksheet.creator', 'submissions.uploader', 'submissions.review.teacher.user', 'submissions.review.report')
            ->latest('assigned_at')
            ->get();
        $reports = $student->reports()->latest()->get();

        return [
            'student' => $student->load('user', 'schoolClass'),
            'summary' => [
                'assignments' => $assignments->count(),
                'submitted' => $assignments->whereIn('status', ['submitted', 'checked'])->count(),
                'checked' => $assignments->where('status', 'checked')->count(),
                'average_progress' => round((float) ($reports->avg('progress') ?? 0), 2),
            ],
            'assignments' => $assignments,
            'reports' => $reports,
        ];
    }
}
