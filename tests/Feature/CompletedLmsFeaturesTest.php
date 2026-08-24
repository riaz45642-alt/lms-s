<?php

namespace Tests\Feature;

use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompletedLmsFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_course_completion_updates_progress_and_issues_certificate(): void
    {
        $admin=User::factory()->create(['role'=>'admin']); $student=User::factory()->create(['role'=>'student']); StudentProfile::create(['user_id'=>$student->id]);
        $course=DB::table('courses')->insertGetId(['created_by'=>$admin->id,'title'=>'Number Trail','slug'=>'number-trail','is_published'=>true,'difficulty'=>'beginner','created_at'=>now(),'updated_at'=>now()]);
        $first=DB::table('lessons')->insertGetId(['course_id'=>$course,'title'=>'Count','position'=>1,'is_published'=>true,'created_at'=>now(),'updated_at'=>now()]);
        $second=DB::table('lessons')->insertGetId(['course_id'=>$course,'title'=>'Add','position'=>2,'is_published'=>true,'created_at'=>now(),'updated_at'=>now()]);
        Sanctum::actingAs($student);
        $this->postJson("/api/courses/$course/enroll")->assertCreated();
        $this->postJson("/api/lessons/$first/complete")->assertOk()->assertJsonPath('progress',50);
        $this->postJson("/api/lessons/$second/complete")->assertOk()->assertJsonPath('completed',true);
        $this->assertDatabaseHas('course_enrollments',['course_id'=>$course,'user_id'=>$student->id,'progress'=>100]);
        $this->assertDatabaseHas('certificates',['course_id'=>$course,'user_id'=>$student->id]);
    }

    public function test_quiz_scoring_and_attempt_limits_are_enforced(): void
    {
        $admin=User::factory()->create(['role'=>'admin']);$student=User::factory()->create(['role'=>'student']);StudentProfile::create(['user_id'=>$student->id]);
        $quiz=DB::table('quizzes')->insertGetId(['created_by'=>$admin->id,'title'=>'Dino Maths','passing_score'=>70,'max_attempts'=>1,'is_published'=>true,'created_at'=>now(),'updated_at'=>now()]);
        $question=DB::table('quiz_questions')->insertGetId(['quiz_id'=>$quiz,'prompt'=>'2 + 2?','options'=>json_encode(['3','4']),'correct_answer'=>'4','points'=>1,'position'=>1,'created_at'=>now(),'updated_at'=>now()]);
        Sanctum::actingAs($student);
        $this->postJson("/api/quizzes/$quiz/attempts",['answers'=>[$question=>'4']])->assertCreated()->assertJsonPath('percentage',100)->assertJsonPath('passed',true);
        $this->postJson("/api/quizzes/$quiz/attempts",['answers'=>[$question=>'4']])->assertStatus(409);
    }

    public function test_search_hides_admin_entities_from_students(): void
    {
        $admin=User::factory()->create(['role'=>'admin','name'=>'Secret Admin']);$student=User::factory()->create(['role'=>'student']);StudentProfile::create(['user_id'=>$student->id]);
        DB::table('courses')->insert(['created_by'=>$admin->id,'title'=>'Space Numbers','slug'=>'space-numbers','is_published'=>true,'difficulty'=>'beginner','created_at'=>now(),'updated_at'=>now()]);
        Sanctum::actingAs($student);
        $this->getJson('/api/search?q=Space')->assertOk()->assertJsonPath('courses.0.title','Space Numbers')->assertJsonMissingPath('users');
    }

    public function test_messaging_is_limited_to_learning_relationships(): void
    {
        $teacherUser=User::factory()->create(['role'=>'teacher']);$teacher=TeacherProfile::create(['user_id'=>$teacherUser->id]);
        $studentUser=User::factory()->create(['role'=>'student']);$student=StudentProfile::create(['user_id'=>$studentUser->id]);$teacher->students()->attach($student);
        $outsider=User::factory()->create(['role'=>'student']);StudentProfile::create(['user_id'=>$outsider->id]);
        Sanctum::actingAs($teacherUser);
        $this->postJson('/api/messages',['recipient_id'=>$studentUser->id,'body'=>'Great work!'])->assertCreated();
        $this->postJson('/api/messages',['recipient_id'=>$outsider->id,'body'=>'Not allowed'])->assertForbidden();
    }

    public function test_only_admin_can_change_roles_and_status(): void
    {
        $admin=User::factory()->create(['role'=>'admin']);$teacher=User::factory()->create(['role'=>'teacher']);TeacherProfile::create(['user_id'=>$teacher->id]);$student=User::factory()->create(['role'=>'student']);StudentProfile::create(['user_id'=>$student->id]);
        Sanctum::actingAs($teacher);$this->patchJson("/api/admin/users/$student->id",['status'=>'suspended'])->assertForbidden();
        Sanctum::actingAs($admin);$this->patchJson("/api/admin/users/$student->id",['status'=>'suspended'])->assertOk()->assertJsonPath('status','suspended');
    }
}
