<?php

namespace Database\Seeders;

use App\Models\ParentProfile;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LmsDemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $teacherUser = User::updateOrCreate(
                ['email' => 'teacher@example.com'],
                ['name' => 'Demo Teacher', 'password' => 'password', 'role' => 'teacher']
            );
            $parentUser = User::updateOrCreate(
                ['email' => 'parent@example.com'],
                ['name' => 'Demo Parent', 'password' => 'password', 'role' => 'parent']
            );
            $studentUser = User::updateOrCreate(
                ['email' => 'student@example.com'],
                ['name' => 'Demo Student', 'password' => 'password', 'role' => 'student']
            );

            $teacherUser->assignRole('teacher');
            $parentUser->assignRole('parent');
            $studentUser->assignRole('student');

            $teacher = TeacherProfile::updateOrCreate(
                ['user_id' => $teacherUser->id],
                ['employee_number' => 'T-DEMO-001', 'specialization' => 'Primary Education']
            );
            $parent = ParentProfile::updateOrCreate(
                ['user_id' => $parentUser->id],
                ['phone' => null]
            );
            $student = StudentProfile::updateOrCreate(
                ['user_id' => $studentUser->id],
                ['student_number' => 'S-DEMO-001', 'grade_level' => 'Year 4']
            );

            $parent->students()->syncWithoutDetaching([$student->id => ['relationship' => 'Guardian']]);
            $teacher->students()->syncWithoutDetaching([$student->id]);
        });
    }
}
