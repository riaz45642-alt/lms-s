<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worksheet_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worksheet_id')->constrained('worksheets')->restrictOnDelete();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('assigned_by')->constrained('users')->restrictOnDelete();
            $table->text('instructions')->nullable();
            $table->timestampTz('assigned_at')->useCurrent();
            $table->timestampTz('due_at')->nullable()->index();
            $table->boolean('allow_resubmission')->default(false);
            $table->boolean('allow_late_submission')->default(false);
            $table->string('status', 20)->default('assigned')->index();
            $table->timestamps();
            $table->unique(['worksheet_id', 'student_id', 'assigned_at']);
            $table->index(['student_id', 'status', 'due_at']);
            $table->index(['assigned_by', 'created_at']);
        });

        Schema::create('worksheet_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('worksheet_assignments')->cascadeOnDelete();
            $table->unsignedSmallInteger('attempt_number')->default(1);
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size');
            $table->text('student_note')->nullable();
            $table->timestampTz('submitted_at')->useCurrent()->index();
            $table->timestamps();
            $table->index(['uploaded_by', 'submitted_at']);
            $table->unique(['assignment_id', 'attempt_number']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE worksheet_assignments ADD CONSTRAINT worksheet_assignments_status_check CHECK (status IN ('assigned', 'submitted', 'checked'))");
            DB::statement('ALTER TABLE worksheet_submissions ADD CONSTRAINT worksheet_submissions_file_size_check CHECK (file_size > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('worksheet_submissions');
        Schema::dropIfExists('worksheet_assignments');
    }
};
