<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique()->after('email');
            $table->string('avatar_url', 2048)->nullable()->after('google_id');
            $table->string('status', 20)->default('active')->index()->after('role');
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id(); $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('title'); $table->string('slug')->unique(); $table->text('description')->nullable();
            $table->string('grade_level', 50)->nullable()->index(); $table->string('difficulty', 30)->default('beginner');
            $table->string('cover_url', 2048)->nullable(); $table->boolean('is_published')->default(false)->index(); $table->timestamps();
        });
        Schema::create('lessons', function (Blueprint $table) {
            $table->id(); $table->foreignId('course_id')->constrained()->cascadeOnDelete(); $table->string('title');
            $table->text('summary')->nullable(); $table->longText('content')->nullable(); $table->string('video_url', 2048)->nullable();
            $table->unsignedInteger('position')->default(0); $table->unsignedInteger('duration_minutes')->default(0);
            $table->boolean('is_published')->default(false); $table->timestamps(); $table->unique(['course_id','position']);
        });
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id(); $table->foreignId('course_id')->constrained()->cascadeOnDelete(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('started_at')->nullable(); $table->timestamp('completed_at')->nullable(); $table->unsignedTinyInteger('progress')->default(0); $table->timestamps();
            $table->unique(['course_id','user_id']);
        });
        Schema::create('lesson_completions', function (Blueprint $table) {
            $table->id(); $table->foreignId('lesson_id')->constrained()->cascadeOnDelete(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent(); $table->timestamps(); $table->unique(['lesson_id','user_id']);
        });

        Schema::create('workbooks', function (Blueprint $table) {
            $table->id(); $table->foreignId('created_by')->constrained('users')->restrictOnDelete(); $table->string('title');
            $table->text('description')->nullable(); $table->string('subject', 100); $table->string('grade_level', 50)->nullable();
            $table->string('difficulty', 30)->default('beginner'); $table->string('file_path')->nullable(); $table->boolean('is_published')->default(false)->index(); $table->timestamps();
        });
        Schema::create('workbook_worksheet', function (Blueprint $table) {
            $table->foreignId('workbook_id')->constrained()->cascadeOnDelete(); $table->foreignId('worksheet_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0); $table->primary(['workbook_id','worksheet_id']);
        });

        Schema::create('quizzes', function (Blueprint $table) {
            $table->id(); $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete(); $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->string('title'); $table->text('description')->nullable(); $table->string('subject',100)->nullable(); $table->string('grade_level',50)->nullable();
            $table->unsignedTinyInteger('passing_score')->default(70); $table->unsignedTinyInteger('max_attempts')->default(3); $table->boolean('is_published')->default(false)->index(); $table->timestamps();
        });
        Schema::create('quiz_questions', function (Blueprint $table) {
            $table->id(); $table->foreignId('quiz_id')->constrained()->cascadeOnDelete(); $table->text('prompt'); $table->json('options');
            $table->string('correct_answer'); $table->text('explanation')->nullable(); $table->unsignedInteger('position')->default(0); $table->unsignedSmallInteger('points')->default(1); $table->timestamps();
        });
        Schema::create('quiz_attempts', function (Blueprint $table) {
            $table->id(); $table->foreignId('quiz_id')->constrained()->cascadeOnDelete(); $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->json('answers'); $table->unsignedSmallInteger('score')->default(0); $table->unsignedSmallInteger('total')->default(0); $table->unsignedTinyInteger('percentage')->default(0);
            $table->boolean('passed')->default(false); $table->timestamp('completed_at')->useCurrent(); $table->timestamps(); $table->index(['user_id','quiz_id']);
        });

        Schema::create('user_content_items', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('kind',20)->index();
            $table->string('content_type',40); $table->unsignedBigInteger('content_id'); $table->timestamps();
            $table->unique(['user_id','kind','content_type','content_id'],'user_content_unique'); $table->index(['content_type','content_id']);
        });
        Schema::create('activity_log', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('action',50);
            $table->string('content_type',40); $table->unsignedBigInteger('content_id'); $table->json('metadata')->nullable(); $table->timestamps(); $table->index(['user_id','created_at']);
        });
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary(); $table->string('type'); $table->morphs('notifiable'); $table->text('data'); $table->timestamp('read_at')->nullable(); $table->timestamps();
        });
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id(); $table->foreignId('created_by')->constrained('users')->cascadeOnDelete(); $table->foreignId('class_id')->nullable()->constrained('classes')->cascadeOnDelete();
            $table->string('title'); $table->text('description')->nullable(); $table->string('event_type',30)->default('event'); $table->dateTime('starts_at'); $table->dateTime('ends_at')->nullable(); $table->timestamps();
        });
        Schema::create('certificates', function (Blueprint $table) {
            $table->id(); $table->uuid('code')->unique(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->timestamp('issued_at')->useCurrent(); $table->timestamps(); $table->unique(['user_id','course_id']);
        });
        Schema::create('billing_plans', function (Blueprint $table) {
            $table->id(); $table->string('name'); $table->string('slug')->unique(); $table->text('description')->nullable(); $table->unsignedInteger('price_cents')->default(0);
            $table->string('currency',3)->default('USD'); $table->string('interval',20)->default('month'); $table->json('features')->nullable(); $table->boolean('is_active')->default(true); $table->timestamps();
        });
        Schema::create('billing_interests', function (Blueprint $table) {
            $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('billing_plan_id')->constrained()->restrictOnDelete();
            $table->string('status',30)->default('pending_provider'); $table->timestamps(); $table->index(['user_id','status']);
        });
        DB::table('billing_plans')->insert([
            ['name'=>'Explorer','slug'=>'explorer','description'=>'Core courses, activities, and saved learning paths.','price_cents'=>0,'currency'=>'USD','interval'=>'month','features'=>json_encode(['Course library','Progress tracking','Bookmarks']),'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Growing Learner','slug'=>'growing-learner','description'=>'More practice packs and family learning tools.','price_cents'=>900,'currency'=>'USD','interval'=>'month','features'=>json_encode(['Everything in Explorer','Worksheet bundles','Workbooks','Certificates']),'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
            ['name'=>'Family Galaxy','slug'=>'family-galaxy','description'=>'A complete family learning space for multiple children.','price_cents'=>1600,'currency'=>'USD','interval'=>'month','features'=>json_encode(['Everything in Growing Learner','Family progress','Priority learning support']),'is_active'=>true,'created_at'=>now(),'updated_at'=>now()],
        ]);
    }

    public function down(): void
    {
        foreach (['billing_interests','billing_plans','certificates','calendar_events','notifications','activity_log','user_content_items','quiz_attempts','quiz_questions','quizzes','workbook_worksheet','workbooks','lesson_completions','course_enrollments','lessons','courses'] as $table) Schema::dropIfExists($table);
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['google_id','avatar_url','status']));
    }
};
