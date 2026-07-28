<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->unique()->constrained('worksheet_submissions')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teacher_profiles')->restrictOnDelete();
            $table->decimal('obtained_marks', 8, 2)->nullable();
            $table->decimal('total_marks', 8, 2)->nullable();
            $table->decimal('percentage', 5, 2)->nullable();
            $table->text('remarks')->nullable();
            $table->string('status', 20)->default('pending')->index();
            $table->timestampTz('checked_at')->nullable()->index();
            $table->timestamps();
            $table->index(['teacher_id', 'status', 'created_at']);
        });

        Schema::create('performance_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('student_profiles')->cascadeOnDelete();
            $table->foreignId('review_id')->unique()->constrained('teacher_reviews')->cascadeOnDelete();
            $table->string('overall_grade', 10);
            $table->decimal('progress', 5, 2);
            $table->text('teacher_comment')->nullable();
            $table->timestamps();
            $table->index(['student_id', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE teacher_reviews ADD CONSTRAINT teacher_reviews_status_check CHECK (status IN ('pending', 'checked'))");
            DB::statement('ALTER TABLE teacher_reviews ADD CONSTRAINT teacher_reviews_marks_check CHECK ((status = \'pending\' AND checked_at IS NULL) OR (status = \'checked\' AND obtained_marks IS NOT NULL AND total_marks > 0 AND obtained_marks >= 0 AND obtained_marks <= total_marks AND percentage BETWEEN 0 AND 100 AND checked_at IS NOT NULL))');
            DB::statement('ALTER TABLE performance_reports ADD CONSTRAINT performance_reports_progress_check CHECK (progress BETWEEN 0 AND 100)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reports');
        Schema::dropIfExists('teacher_reviews');
    }
};
