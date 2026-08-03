<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return $this->profile($request);
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'grade_level' => ['nullable', 'string', 'max:50'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
        ]);

        $user->update(array_intersect_key($data, ['name' => true]));

        if ($user->parentProfile) {
            $user->parentProfile->update(array_intersect_key($data, ['phone' => true]));
        } elseif ($user->teacherProfile) {
            $user->teacherProfile->update(array_intersect_key($data, ['specialization' => true]));
        } elseif ($user->studentProfile) {
            $user->studentProfile->update(array_intersect_key($data, [
                'grade_level' => true,
                'date_of_birth' => true,
            ]));
        }

        return $this->profile($request);
    }

    private function profile(Request $request)
    {
        return $request->user()->load(
            'roles.permissions',
            'parentProfile.students.user',
            'teacherProfile.students.user',
            'studentProfile.parent.user',
            'studentProfile.teachers.user',
            'studentProfile.schoolClass'
        );
    }
}
