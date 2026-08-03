<?php

namespace Tests\Feature;

use App\Models\ParentProfile;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use App\Models\WorksheetAssignment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NewBusinessRulesTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_an_admin_can_manage_a_worksheet(): void
    {
        Storage::fake('local');
        Sanctum::actingAs(User::factory()->create(['role' => 'teacher']));
        $this->post('/api/worksheets', $this->worksheetPayload())->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $worksheetId = $this->post('/api/worksheets', $this->worksheetPayload())
            ->assertCreated()->assertJsonPath('created_by', $admin->id)->json('id');
        $this->patchJson("/api/worksheets/{$worksheetId}", ['title' => 'Admin updated'])
            ->assertOk()->assertJsonPath('title', 'Admin updated');
        $this->deleteJson("/api/worksheets/{$worksheetId}")->assertNoContent();
    }

    public function test_student_registration_links_valid_parent_and_teacher_ids(): void
    {
        $parent = ParentProfile::create(['user_id' => User::factory()->create(['role' => 'parent'])->id]);
        $teacher = TeacherProfile::create(['user_id' => User::factory()->create(['role' => 'teacher'])->id]);
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Linked Student', 'email' => 'linked@example.test',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'role' => 'student', 'parent_id' => $parent->id, 'teacher_id' => $teacher->id,
        ])->assertCreated();

        $student = StudentProfile::where('user_id', $response->json('user.id'))->firstOrFail();
        $this->assertSame($parent->id, $student->parent_id);
        $this->assertTrue($student->teachers()->whereKey($teacher->id)->exists());
    }

    public function test_invalid_links_are_rejected_and_independent_students_are_allowed(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Invalid Link', 'email' => 'invalid@example.test',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'role' => 'student', 'parent_id' => 999999,
        ])->assertUnprocessable()->assertJsonValidationErrors('parent_id');

        $this->postJson('/api/auth/register', [
            'name' => 'Independent', 'email' => 'independent@example.test',
            'password' => 'password123', 'password_confirmation' => 'password123',
            'role' => 'student',
        ])->assertCreated();
        $this->assertDatabaseHas('student_profiles', ['parent_id' => null]);
    }

    public function test_one_parent_has_many_children_and_a_student_submits_own_assignment(): void
    {
        Storage::fake('local');
        $parent = ParentProfile::create(['user_id' => User::factory()->create(['role' => 'parent'])->id]);
        $firstUser = User::factory()->create(['role' => 'student']);
        $first = StudentProfile::create(['user_id' => $firstUser->id, 'parent_id' => $parent->id]);
        StudentProfile::create(['user_id' => User::factory()->create(['role' => 'student'])->id, 'parent_id' => $parent->id]);
        $this->assertCount(2, $parent->students);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $worksheetId = $this->post('/api/worksheets', $this->worksheetPayload())->assertCreated()->json('id');
        $assignmentId = $this->postJson('/api/assignments', [
            'worksheet_id' => $worksheetId, 'student_id' => $first->id,
        ])->assertCreated()->json('id');

        Sanctum::actingAs($firstUser);
        $this->post("/api/assignments/{$assignmentId}/submission", [
            'file' => UploadedFile::fake()->create('answer.pdf', 20, 'application/pdf'),
        ])->assertCreated();
    }

    public function test_teacher_views_linked_student_work_but_cannot_assign_or_manage_it(): void
    {
        Storage::fake('local');
        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = TeacherProfile::create(['user_id' => $teacherUser->id]);
        $student = StudentProfile::create(['user_id' => User::factory()->create(['role' => 'student'])->id]);
        $teacher->students()->attach($student);

        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $worksheetId = $this->post('/api/worksheets', $this->worksheetPayload())->assertCreated()->json('id');
        $this->postJson('/api/assignments', ['worksheet_id' => $worksheetId, 'student_id' => $student->id])->assertCreated();

        Sanctum::actingAs($teacherUser);
        $this->getJson('/api/worksheets')->assertOk()->assertJsonCount(1, 'data');
        $this->postJson('/api/assignments', ['worksheet_id' => $worksheetId, 'student_id' => $student->id])->assertForbidden();
        $this->deleteJson("/api/worksheets/{$worksheetId}")->assertForbidden();

        Sanctum::actingAs($student->user);
        $this->getJson('/api/students')->assertForbidden();
        $this->getJson("/api/worksheets/{$worksheetId}")->assertOk();
    }

    public function test_deadlines_duplicates_and_versioned_resubmissions_are_enforced(): void
    {
        Storage::fake('local');
        $studentUser = User::factory()->create(['role' => 'student']);
        $student = StudentProfile::create(['user_id' => $studentUser->id]);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));
        $worksheetId = $this->post('/api/worksheets', $this->worksheetPayload())->assertCreated()->json('id');
        $assignmentId = $this->postJson('/api/assignments', [
            'worksheet_id' => $worksheetId,
            'student_id' => $student->id,
        ])->assertCreated()->json('id');

        Sanctum::actingAs($studentUser);
        $upload = fn (string $name) => $this->post("/api/assignments/{$assignmentId}/submission", [
            'file' => UploadedFile::fake()->create($name, 20, 'application/pdf'),
        ]);
        $upload('attempt-1.pdf')->assertCreated()->assertJsonPath('attempt_number', 1);
        $upload('duplicate.pdf')->assertStatus(409);

        $assignment = WorksheetAssignment::findOrFail($assignmentId);
        $assignment->update(['allow_resubmission' => true]);
        $upload('attempt-2.pdf')->assertCreated()->assertJsonPath('attempt_number', 2);

        $assignment->update(['due_at' => now()->subMinute(), 'allow_late_submission' => false]);
        $upload('late-blocked.pdf')->assertStatus(409);
        $assignment->update(['allow_late_submission' => true]);
        $upload('attempt-3.pdf')->assertCreated()->assertJsonPath('attempt_number', 3);
        $this->assertDatabaseCount('worksheet_submissions', 3);
    }

    public function test_student_progress_history_is_visible_only_to_authorized_relationships(): void
    {
        $student = StudentProfile::create(['user_id' => User::factory()->create(['role' => 'student'])->id]);
        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = TeacherProfile::create(['user_id' => $teacherUser->id]);
        $teacher->students()->attach($student);

        Sanctum::actingAs($teacherUser);
        $this->getJson("/api/students/{$student->id}/progress")
            ->assertOk()
            ->assertJsonPath('student.id', $student->id)
            ->assertJsonPath('summary.assignments', 0);

        $unrelatedTeacher = User::factory()->create(['role' => 'teacher']);
        TeacherProfile::create(['user_id' => $unrelatedTeacher->id]);
        Sanctum::actingAs($unrelatedTeacher);
        $this->getJson("/api/students/{$student->id}/progress")->assertForbidden();
    }

    private function worksheetPayload(): array
    {
        return [
            'title' => 'Admin Worksheet', 'subject' => 'Maths', 'grade_level' => 'Year 4',
            'is_published' => true,
            'file' => UploadedFile::fake()->create('worksheet.pdf', 20, 'application/pdf'),
        ];
    }
}
