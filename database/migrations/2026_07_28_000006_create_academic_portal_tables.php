<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->string('grade_level', 50)->index();
            $table->string('academic_year', 20);
            $table->foreignId('homeroom_teacher_id')->nullable()->index()
                ->constrained('teacher_profiles')->nullOnDelete();
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->index(['academic_year', 'grade_level', 'is_active']);
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 50)->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('teaching_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained('teacher_profiles')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->timestamps();
            $table->unique(['teacher_id', 'class_id', 'subject_id']);
            $table->index(['class_id', 'subject_id']);
            $table->index(['subject_id', 'teacher_id']);
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->foreignId('class_id')->nullable()->after('user_id')->index()
                ->constrained('classes')->nullOnDelete();
        });

        Schema::create('direct_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('recipient_id')->constrained('users')->cascadeOnDelete();
            $table->string('subject')->nullable();
            $table->text('body');
            $table->timestampTz('read_at')->nullable();
            $table->timestamps();
            $table->index(['recipient_id', 'read_at', 'created_at']);
            $table->index(['sender_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE classes ADD CONSTRAINT classes_dates_check CHECK (ends_on IS NULL OR starts_on IS NULL OR ends_on >= starts_on)');
            DB::statement('ALTER TABLE direct_messages ADD CONSTRAINT direct_messages_participants_check CHECK (sender_id <> recipient_id)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('direct_messages');

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropIndex(['class_id']);

            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['class_id']);
            }

            $table->dropColumn('class_id');
        });

        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('classes');
    }
};
