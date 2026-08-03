<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PerformanceReport;
use Illuminate\Http\Request;

class PerformanceReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = PerformanceReport::with('student.user', 'review.teacher.user', 'review.submission.assignment.worksheet');

        if ($user->hasRole('student')) {
            $query->where('student_id', $user->studentProfile?->id);
        } elseif ($user->hasRole('parent')) {
            $query->whereIn('student_id', $user->parentProfile?->students()->pluck('student_profiles.id') ?? []);
        } elseif ($user->hasRole('teacher')) {
            $query->whereHas('review', fn ($q) => $q->where('teacher_id', $user->teacherProfile?->id));
        } elseif (! $user->hasRole('admin')) {
            $query->whereRaw('1 = 0');
        }

        return $query->latest()->paginate(20);
    }

    public function show(Request $request, PerformanceReport $performanceReport)
    {
        $user = $request->user();
        $allowed = $user->hasRole('admin')
            || ($user->hasRole('student') && $performanceReport->student_id === $user->studentProfile?->id)
            || ($user->hasRole('parent') && $user->parentProfile?->students()->whereKey($performanceReport->student_id)->exists())
            || ($user->hasRole('teacher') && $performanceReport->review->teacher_id === $user->teacherProfile?->id);
        abort_unless($allowed, 403);

        return $performanceReport->load('student.user', 'review.teacher.user', 'review.submission.assignment.worksheet');
    }
}
