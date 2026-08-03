<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Worksheet;

class WorksheetPolicy
{
    public function before(User $user): ?bool
    {
        return $user->hasRole('admin') ? true : null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasRole('teacher', 'parent', 'student');
    }

    public function view(User $user, Worksheet $worksheet): bool
    {
        if ($user->hasRole('student')) {
            return $worksheet->assignments()
                ->where('student_id', $user->studentProfile?->id)
                ->exists();
        }

        if ($user->hasRole('teacher')) {
            return $worksheet->assignments()
                ->whereHas('student.teachers', fn ($query) => $query->whereKey($user->teacherProfile?->id))
                ->exists();
        }

        if ($user->hasRole('parent')) {
            return $worksheet->is_published || $worksheet->assignments()
                ->whereIn('student_id', $user->parentProfile?->students()->select('id') ?? [])
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Worksheet $worksheet): bool
    {
        return false;
    }

    public function delete(User $user, Worksheet $worksheet): bool
    {
        return false;
    }
}
