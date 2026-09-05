<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->softDeletes());

        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('billing_plan_id')->constrained()->restrictOnDelete();
            $table->foreignId('billing_interest_id')->nullable()->constrained('billing_interests')->nullOnDelete();
            $table->string('status', 30)->default('pending')->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable()->index();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('admin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 80)->index();
            $table->string('target_type', 80)->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->string('target_label')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index(['target_type', 'target_id']);
            $table->index(['created_at', 'actor_id']);
        });

        Schema::table('calendar_events', function (Blueprint $table) {
            $table->boolean('is_published')->default(true)->index();
            $table->string('status', 20)->default('scheduled')->index();
        });

        DB::table('billing_interests')->where('status', 'pending_provider')->update(['status' => 'pending']);
    }

    public function down(): void
    {
        Schema::table('calendar_events', fn (Blueprint $table) => $table->dropColumn(['is_published', 'status']));
        Schema::dropIfExists('admin_audit_logs');
        Schema::dropIfExists('subscriptions');
        Schema::table('users', fn (Blueprint $table) => $table->dropSoftDeletes());
    }
};
