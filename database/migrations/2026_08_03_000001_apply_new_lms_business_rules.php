<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('student_profiles', 'parent_id')) {
            Schema::table('student_profiles', function (Blueprint $table) {
                $table->foreignId('parent_id')->nullable()->index()
                    ->constrained('parent_profiles')->nullOnDelete();
            });

            if (Schema::hasTable('parent_student')) {
                foreach (DB::table('parent_student')->orderBy('student_id')->orderBy('parent_id')->get() as $link) {
                    DB::table('student_profiles')
                        ->where('id', $link->student_id)
                        ->whereNull('parent_id')
                        ->update(['parent_id' => $link->parent_id]);
                }
            }
        }

        Schema::dropIfExists('parent_student');

        foreach (['worksheets', 'worksheet_bundles'] as $tableName) {
            if (! Schema::hasColumn($tableName, 'created_by')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->foreignId('created_by')->nullable()->index()
                        ->constrained('users')->restrictOnDelete();
                });

                DB::table($tableName)
                    ->join('teacher_profiles', "{$tableName}.teacher_id", '=', 'teacher_profiles.id')
                    ->whereNull("{$tableName}.created_by")
                    ->update(['created_by' => DB::raw('teacher_profiles.user_id')]);
            }
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE worksheets ALTER COLUMN teacher_id DROP NOT NULL');
            DB::statement('ALTER TABLE worksheet_bundles ALTER COLUMN teacher_id DROP NOT NULL');
            DB::statement('ALTER TABLE worksheets ALTER COLUMN created_by SET NOT NULL');
            DB::statement('ALTER TABLE worksheet_bundles ALTER COLUMN created_by SET NOT NULL');
        }

        $permissionId = DB::table('permissions')->where('slug', 'worksheets.manage')->value('id');
        if (! $permissionId) {
            $permissionId = DB::table('permissions')->insertGetId([
                'name' => 'Manage worksheets',
                'slug' => 'worksheets.manage',
                'group' => 'worksheets',
                'description' => 'Create, edit, publish, and delete worksheets and bundles.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $adminRoleId = DB::table('roles')->where('slug', 'admin')->value('id');
        if ($adminRoleId) {
            DB::table('role_permissions')->updateOrInsert(
                ['role_id' => $adminRoleId, 'permission_id' => $permissionId],
                ['created_at' => now(), 'updated_at' => now()]
            );
        }

        $teacherRoleId = DB::table('roles')->where('slug', 'teacher')->value('id');
        $worksheetPermissionIds = DB::table('permissions')
            ->whereIn('slug', ['worksheets.create', 'worksheets.manage'])
            ->pluck('id');
        if ($teacherRoleId) {
            DB::table('role_permissions')
                ->where('role_id', $teacherRoleId)
                ->whereIn('permission_id', $worksheetPermissionIds)
                ->delete();
        }

        $primaryRoles = ['admin', 'teacher', 'parent', 'student'];
        $adminRoleId = DB::table('roles')->where('slug', 'admin')->value('id');
        foreach (DB::table('roles')->whereNotIn('slug', $primaryRoles)->pluck('id') as $obsoleteRoleId) {
            foreach (DB::table('user_roles')->where('role_id', $obsoleteRoleId)->pluck('user_id') as $userId) {
                DB::table('user_roles')->updateOrInsert(
                    ['user_id' => $userId, 'role_id' => $adminRoleId],
                    ['assigned_by' => null, 'assigned_at' => now()]
                );
            }
            DB::table('user_roles')->where('role_id', $obsoleteRoleId)->delete();
            DB::table('role_permissions')->where('role_id', $obsoleteRoleId)->delete();
            DB::table('roles')->where('id', $obsoleteRoleId)->delete();
        }
        DB::table('users')->whereNotIn('role', $primaryRoles)->update(['role' => 'admin']);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
            DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'teacher', 'parent', 'student'))");
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('parent_student')) {
            Schema::create('parent_student', function (Blueprint $table) {
                $table->foreignId('parent_id')->constrained('parent_profiles')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
                $table->string('relationship', 50)->nullable();
                $table->timestamps();
                $table->primary(['parent_id', 'student_id']);
            });

            foreach (DB::table('student_profiles')->whereNotNull('parent_id')->get() as $student) {
                DB::table('parent_student')->insert([
                    'parent_id' => $student->parent_id,
                    'student_id' => $student->id,
                    'relationship' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        if (Schema::hasColumn('student_profiles', 'parent_id')) {
            Schema::table('student_profiles', function (Blueprint $table) {
                $table->dropConstrainedForeignId('parent_id');
            });
        }
    }
};
