<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
            $table->string('portal_path')->nullable();
            $table->unsignedSmallInteger('priority')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('slug', 150)->unique();
            $table->string('group', 100)->index();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->timestamps();
            $table->primary(['role_id', 'permission_id']);
            $table->index(['permission_id', 'role_id']);
        });

        Schema::create('user_roles', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->restrictOnDelete();
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('assigned_at')->useCurrent();
            $table->primary(['user_id', 'role_id']);
            $table->index(['role_id', 'user_id']);
            $table->index('assigned_by');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
        }

        $now = now();
        DB::table('roles')->insert([
            ['name' => 'Admin', 'slug' => 'admin', 'portal_path' => '/admin', 'priority' => 100, 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Teacher', 'slug' => 'teacher', 'portal_path' => '/teacher', 'priority' => 80, 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Parent', 'slug' => 'parent', 'portal_path' => '/parent', 'priority' => 60, 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'Student', 'slug' => 'student', 'portal_path' => '/student', 'priority' => 40, 'is_system' => true, 'created_at' => $now, 'updated_at' => $now],
        ]);

        $permissions = [
            ['Manage users', 'users.manage', 'users'],
            ['Manage roles and permissions', 'rbac.manage', 'security'],
            ['Manage classes', 'classes.manage', 'academics'],
            ['Manage subjects', 'subjects.manage', 'academics'],
            ['View all reports', 'reports.view-all', 'reports'],
            ['Create worksheets', 'worksheets.create', 'worksheets'],
            ['Manage worksheets', 'worksheets.manage', 'worksheets'],
            ['Assign worksheets', 'assignments.create', 'assignments'],
            ['Review submissions', 'submissions.review', 'submissions'],
            ['Generate performance reports', 'reports.create', 'reports'],
            ['Submit assignments', 'submissions.create', 'submissions'],
            ['View own progress', 'progress.view-own', 'reports'],
            ['View child progress', 'progress.view-child', 'reports'],
            ['Send messages', 'messages.send', 'messages'],
        ];

        DB::table('permissions')->insert(array_map(
            fn (array $permission) => [
                'name' => $permission[0],
                'slug' => $permission[1],
                'group' => $permission[2],
                'description' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            $permissions
        ));

        $roleIds = DB::table('roles')->pluck('id', 'slug');
        $permissionIds = DB::table('permissions')->pluck('id', 'slug');
        $grants = [
            'admin' => array_keys($permissionIds->all()),
            'teacher' => [
                'classes.manage',
                'submissions.review', 'reports.create', 'messages.send',
            ],
            'student' => ['submissions.create', 'progress.view-own', 'messages.send'],
            'parent' => ['assignments.create', 'progress.view-child', 'messages.send'],
        ];

        foreach ($grants as $role => $permissionSlugs) {
            foreach ($permissionSlugs as $permissionSlug) {
                DB::table('role_permissions')->insert([
                    'role_id' => $roleIds[$role],
                    'permission_id' => $permissionIds[$permissionSlug],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        foreach (DB::table('users')->select('id', 'role')->orderBy('id')->cursor() as $user) {
            if (isset($roleIds[$user->role])) {
                DB::table('user_roles')->insert([
                    'user_id' => $user->id,
                    'role_id' => $roleIds[$user->role],
                    'assigned_by' => null,
                    'assigned_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');

        if (DB::getDriverName() === 'pgsql') {
            $hasCustomRoles = DB::table('users')
                ->whereNotIn('role', ['parent', 'teacher', 'student', 'admin'])
                ->exists();

            if (! $hasCustomRoles) {
                DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('parent', 'teacher', 'student', 'admin'))");
            }
        }
    }
};
