<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('worksheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('teacher_profiles')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('subject', 100)->index();
            $table->string('grade_level', 50)->index();
            $table->text('instructions')->nullable();
            $table->string('file_path');
            $table->string('original_filename');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size');
            $table->decimal('default_total_marks', 8, 2)->nullable();
            $table->unsignedSmallInteger('default_due_days')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->timestamps();
            $table->index(['teacher_id', 'created_at']);
            $table->index(['subject', 'grade_level', 'is_published']);
        });

        Schema::create('worksheet_bundles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('teacher_profiles')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->timestamps();
            $table->index(['teacher_id', 'created_at']);
        });

        Schema::create('bundle_worksheet', function (Blueprint $table) {
            $table->foreignId('bundle_id')->constrained('worksheet_bundles')->cascadeOnDelete();
            $table->foreignId('worksheet_id')->constrained('worksheets')->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->primary(['bundle_id', 'worksheet_id']);
            $table->index(['bundle_id', 'position']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE worksheets ADD CONSTRAINT worksheets_file_size_check CHECK (file_size > 0)');
            DB::statement('ALTER TABLE worksheets ADD CONSTRAINT worksheets_default_marks_check CHECK (default_total_marks IS NULL OR default_total_marks > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('bundle_worksheet');
        Schema::dropIfExists('worksheet_bundles');
        Schema::dropIfExists('worksheets');
    }
};
