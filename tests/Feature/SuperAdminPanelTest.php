<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SuperAdminPanelTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admin_can_access_super_admin_endpoints(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        Sanctum::actingAs($student);
        $this->getJson('/api/admin/overview')->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $this->getJson('/api/admin/overview')->assertOk()->assertJsonStructure(['counts', 'recent_users', 'pending_actions']);
        $this->getJson('/api/admin/system')->assertOk()->assertJsonPath('status', 'healthy');
    }

    public function test_admin_can_create_update_delete_and_restore_a_user_without_self_lockout(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $created = $this->postJson('/api/admin/users', ['name' => 'Managed User', 'email' => 'managed@example.com', 'password' => 'temporary-password', 'role' => 'student', 'grade_level' => 'Year 5', 'email_verified' => true])
            ->assertCreated()->assertJsonPath('role', 'student')->json();
        $this->patchJson("/api/admin/users/{$created['id']}", ['name' => 'Managed Teacher', 'role' => 'teacher', 'specialization' => 'Mathematics'])
            ->assertOk()->assertJsonPath('role', 'teacher');
        $this->deleteJson("/api/admin/users/{$created['id']}")->assertNoContent();
        $this->assertSoftDeleted('users', ['id' => $created['id']]);
        $this->postJson("/api/admin/users/{$created['id']}/restore")->assertOk();
        $this->assertDatabaseHas('users', ['id' => $created['id'], 'deleted_at' => null]);
        $this->deleteJson("/api/admin/users/{$admin->id}")->assertStatus(422);
    }

    public function test_admin_can_manage_role_permissions_but_cannot_remove_critical_admin_permissions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $teacher = Role::where('slug', 'teacher')->firstOrFail();
        $permission = Permission::firstOrFail();
        $this->putJson("/api/admin/roles/{$teacher->id}/permissions", ['permission_ids' => [$permission->id]])->assertOk();
        $adminRole = Role::where('slug', 'admin')->firstOrFail();
        $this->putJson("/api/admin/roles/{$adminRole->id}/permissions", ['permission_ids' => []])->assertStatus(422);
    }

    public function test_admin_can_process_and_manage_a_subscription_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $student = User::factory()->create(['role' => 'student']);
        $plan = DB::table('billing_plans')->first();
        $interest = DB::table('billing_interests')->insertGetId(['user_id' => $student->id, 'billing_plan_id' => $plan->id, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()]);
        Sanctum::actingAs($admin);
        $subscription = $this->patchJson("/api/admin/subscription-requests/$interest", ['action' => 'approve'])->assertCreated()->assertJsonPath('status', 'active')->json();
        $this->patchJson("/api/admin/subscriptions/{$subscription['id']}", ['action' => 'cancel'])->assertOk()->assertJsonPath('status', 'cancelled');
        $this->assertDatabaseHas('admin_audit_logs', ['action' => 'subscription.approved', 'target_id' => $subscription['id']]);
    }

    public function test_admin_can_update_subjects_and_create_update_delete_events(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Sanctum::actingAs($admin);
        $subject = Subject::create(['name' => 'Science', 'code' => 'SCI']);
        $this->patchJson("/api/admin/subjects/{$subject->id}", ['description' => 'Updated', 'is_active' => false])->assertOk()->assertJsonPath('is_active', false);
        $event = $this->postJson('/api/admin/events', ['title' => 'Learning Day', 'event_type' => 'event', 'starts_at' => now()->addDay()->toISOString(), 'is_published' => true])->assertCreated()->json();
        $this->patchJson("/api/admin/events/{$event['id']}", ['status' => 'completed'])->assertOk()->assertJsonPath('status', 'completed');
        $this->deleteJson("/api/admin/events/{$event['id']}")->assertNoContent();
        $this->deleteJson("/api/admin/subjects/{$subject->id}")->assertNoContent();
    }
}
