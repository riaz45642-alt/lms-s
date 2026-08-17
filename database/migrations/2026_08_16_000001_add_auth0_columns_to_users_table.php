<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'auth0_sub')) {
                $table->string('auth0_sub')->nullable()->unique()->after('email');
            }

            if (! Schema::hasColumn('users', 'avatar_url')) {
                $table->string('avatar_url', 2048)->nullable()->after('auth0_sub');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'auth0_sub')) {
                $table->dropUnique(['auth0_sub']);
                $table->dropColumn('auth0_sub');
            }

            if (Schema::hasColumn('users', 'avatar_url')) {
                $table->dropColumn('avatar_url');
            }
        });
    }
};
