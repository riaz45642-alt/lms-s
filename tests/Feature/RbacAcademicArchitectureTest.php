<?php

namespace Tests\Feature;

use App\Models\DirectMessage;
use App\Models\SchoolClass;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\TeachingAssignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacAcademicArchitectureTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_permissions_and_portal_resolution_are_database_driven(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->assertTrue($teacher->hasRole('teacher'));
        $this->assertFalse($teacher->hasPermission('worksheets.create'));
        $this->assertFalse($teacher->hasPermission('worksheets.manage'));
        $this->assertSame('/teacher', $teacher->portalPath());
        $this->assertDatabaseHas('user_roles', ['user_id' => $teacher->id]);

        $teacher->assignRole('admin');

        $this->assertTrue($teacher->hasRole('admin'));
        $this->assertTrue($teacher->hasPermission('rbac.manage'));
        $this->assertTrue($teacher->hasPermission('worksheets.manage'));
        $this->assertSame('/admin', $teacher->portalPath());
    }

    public function test_academic_and_messaging_relationships_match_the_schema(): void
    {
        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = TeacherProfile::create(['user_id' => $teacherUser->id]);
        $studentUser = User::factory()->create(['role' => 'student']);

        $class = SchoolClass::create([
            'name' => 'Year 4 Blue',
            'code' => 'Y4-BLUE-2026',
            'grade_level' => 'Year 4',
            'academic_year' => '2026',
            'homeroom_teacher_id' => $teacher->id,
        ]);
        $subject = Subject::create(['name' => 'Mathematics', 'code' => 'MATH']);
        TeachingAssignment::create([
            'teacher_id' => $teacher->id,
            'class_id' => $class->id,
            'subject_id' => $subject->id,
        ]);
        $student = StudentProfile::create([
            'user_id' => $studentUser->id,
            'class_id' => $class->id,
        ]);
        $message = DirectMessage::create([
            'sender_id' => $teacherUser->id,
            'recipient_id' => $studentUser->id,
            'subject' => 'Progress update',
            'body' => 'Your latest work has been reviewed.',
        ]);

        $this->assertTrue($teacher->classes->contains($class));
        $this->assertTrue($teacher->subjects->contains($subject));
        $this->assertTrue($class->students->contains($student));
        $this->assertTrue($student->schoolClass->is($class));
        $this->assertTrue($message->sender->is($teacherUser));
        $this->assertTrue($message->recipient->is($studentUser));
    }
}
