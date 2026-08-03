<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StudentProfile;
use Illuminate\Http\Request;

class StudentDirectoryController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();
        $query = StudentProfile::with('user', 'parent.user', 'teachers.user');

        if ($user->hasRole('parent')) {
            $query->where('parent_id', $user->parentProfile?->id);
        } elseif ($user->hasRole('teacher')) {
            $query->whereHas('teachers', fn ($q) => $q->whereKey($user->teacherProfile?->id));
        } elseif (! $user->hasRole('admin')) {
            abort(403);
        }

        return $query->orderBy('id')->get();
    }
}
