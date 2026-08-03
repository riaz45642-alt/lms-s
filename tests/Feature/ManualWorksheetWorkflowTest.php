<?php

namespace Tests\Feature;

use App\Models\ParentProfile;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ManualWorksheetWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_complete_manual_review_workflow_generates_a_report(): void
    {
        Storage::fake('local');

        $adminUser = User::factory()->create(['role' => 'admin']);
        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = TeacherProfile::create(['user_id' => $teacherUser->id]);
        $parentUser = User::factory()->create(['role' => 'parent']);
        $parent = ParentProfile::create(['user_id' => $parentUser->id]);
        $studentUser = User::factory()->create(['role' => 'student']);
        $student = StudentProfile::create(['user_id' => $studentUser->id, 'parent_id' => $parent->id, 'grade_level' => 'Year 4']);
        $teacher->students()->attach($student);

        Sanctum::actingAs($adminUser);
        $worksheetId = $this->post('/api/worksheets', [
            'title' => 'Fractions Practice',
            'subject' => 'Maths',
            'grade_level' => 'Year 4',
            'default_total_marks' => 20,
            'is_published' => true,
            'file' => UploadedFile::fake()->create('fractions.pdf', 100, 'application/pdf'),
        ])->assertCreated()->json('id');

        Sanctum::actingAs($parentUser);
        $assignmentId = $this->postJson('/api/assignments', [
            'worksheet_id' => $worksheetId,
            'student_id' => $student->id,
            'due_at' => now()->addWeek()->toIso8601String(),
        ])->assertCreated()->json('id');

        $submissionId = $this->post("/api/assignments/{$assignmentId}/submission", [
            'file' => UploadedFile::fake()->create('completed.pdf', 120, 'application/pdf'),
            'student_note' => 'Completed at home.',
        ])->assertCreated()->json('id');

        Sanctum::actingAs($teacherUser);
        $response = $this->postJson("/api/submissions/{$submissionId}/review", [
            'obtained_marks' => 18,
            'total_marks' => 20,
            'remarks' => 'Clear working and accurate answers.',
            'teacher_comment' => 'Excellent progress.',
            'status' => 'checked',
        ])->assertOk();

        $response
            ->assertJsonPath('percentage', '90.00')
            ->assertJsonPath('status', 'checked')
            ->assertJsonPath('report.overall_grade', 'A+')
            ->assertJsonPath('report.progress', '90.00');

        $this->assertDatabaseHas('worksheet_assignments', ['id' => $assignmentId, 'status' => 'checked']);
        $this->assertDatabaseHas('performance_reports', [
            'student_id' => $student->id,
            'overall_grade' => 'A+',
            'teacher_comment' => 'Excellent progress.',
        ]);
    }

    public function test_a_parent_cannot_assign_or_upload_for_an_unlinked_student(): void
    {
        $parentUser = User::factory()->create(['role' => 'parent']);
        ParentProfile::create(['user_id' => $parentUser->id]);
        $student = StudentProfile::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
        ]);
        $teacher = TeacherProfile::create([
            'user_id' => User::factory()->create(['role' => 'teacher'])->id,
        ]);
        $worksheet = $teacher->worksheets()->create([
            'created_by' => $teacher->user_id,
            'title' => 'Private worksheet',
            'subject' => 'Maths',
            'grade_level' => 'Year 4',
            'file_path' => 'worksheets/private.pdf',
            'original_filename' => 'private.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 100,
            'is_published' => true,
        ]);

        Sanctum::actingAs($parentUser);

        $this->postJson('/api/assignments', [
            'worksheet_id' => $worksheet->id,
            'student_id' => $student->id,
        ])->assertForbidden();
    }
}
