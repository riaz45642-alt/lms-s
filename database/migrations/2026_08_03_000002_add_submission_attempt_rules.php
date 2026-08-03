<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('worksheets', 'default_due_days')) {
            Schema::table('worksheets', function (Blueprint $table) {
                $table->unsignedSmallInteger('default_due_days')->nullable()->after('default_total_marks');
            });
        }

        Schema::table('worksheet_assignments', function (Blueprint $table) {
            if (! Schema::hasColumn('worksheet_assignments', 'allow_resubmission')) {
                $table->boolean('allow_resubmission')->default(false)->after('due_at');
            }
            if (! Schema::hasColumn('worksheet_assignments', 'allow_late_submission')) {
                $table->boolean('allow_late_submission')->default(false)->after('allow_resubmission');
            }
        });

        if (! Schema::hasColumn('worksheet_submissions', 'attempt_number')) {
            Schema::table('worksheet_submissions', function (Blueprint $table) {
                $table->unsignedSmallInteger('attempt_number')->default(1)->after('assignment_id');
                $table->dropUnique(['assignment_id']);
                $table->unique(['assignment_id', 'attempt_number']);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('worksheets', 'default_due_days')) {
            Schema::table('worksheets', function (Blueprint $table) {
                $table->dropColumn('default_due_days');
            });
        }

        Schema::table('worksheet_submissions', function (Blueprint $table) {
            $table->dropUnique(['assignment_id', 'attempt_number']);
            $table->dropColumn('attempt_number');
            $table->unique('assignment_id');
        });

        Schema::table('worksheet_assignments', function (Blueprint $table) {
            $table->dropColumn(['allow_resubmission', 'allow_late_submission']);
        });
    }
};
