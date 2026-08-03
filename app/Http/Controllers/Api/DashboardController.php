<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PerformanceReport;
use App\Models\TeacherReview;
use App\Models\User;
use App\Models\Worksheet;
use App\Models\WorksheetAssignment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): array
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            return [
                'role' => 'admin',
                'counts' => [
                    'users' => User::count(),
                    'worksheets' => Worksheet::count(),
                    'assignments' => WorksheetAssignment::count(),
                    'pending_reviews' => TeacherReview::where('status', 'pending')->count(),
                ],
            ];
        }

        if ($user->hasRole('teacher')) {
            $studentIds = $user->teacherProfile?->students()->pluck('student_profiles.id') ?? collect();

            return [
                'role' => 'teacher',
                'counts' => [
                    'students' => $studentIds->count(),
                    'assignments' => WorksheetAssignment::whereIn('student_id', $studentIds)->count(),
                    'submitted' => WorksheetAssignment::whereIn('student_id', $studentIds)->where('status', 'submitted')->count(),
                    'reviews' => TeacherReview::where('teacher_id', $user->teacherProfile?->id)->count(),
                ],
            ];
        }

        $studentIds = $user->hasRole('parent')
            ? ($user->parentProfile?->students()->pluck('id') ?? collect())
            : collect([$user->studentProfile?->id])->filter();

        return [
            'role' => $user->hasRole('parent') ? 'parent' : 'student',
            'counts' => [
                'students' => $user->hasRole('parent') ? $studentIds->count() : 1,
                'assignments' => WorksheetAssignment::whereIn('student_id', $studentIds)->count(),
                'completed' => WorksheetAssignment::whereIn('student_id', $studentIds)->where('status', 'checked')->count(),
                'reports' => PerformanceReport::whereIn('student_id', $studentIds)->count(),
            ],
        ];
    }
}
