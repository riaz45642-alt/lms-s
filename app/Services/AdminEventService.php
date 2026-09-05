<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AdminEventService
{
    public function notifyAdmins(string $type, string $title, string $message, ?string $resourceType = null, ?int $resourceId = null): void
    {
        if (! Schema::hasTable('notifications')) return;
        $now = now();
        $rows = User::where('role', 'admin')->pluck('id')->map(fn ($id) => [
            'id' => (string) Str::uuid(), 'type' => $type, 'notifiable_type' => User::class, 'notifiable_id' => $id,
            'data' => json_encode(['title' => $title, 'message' => $message, 'resource_type' => $resourceType, 'resource_id' => $resourceId]),
            'read_at' => null, 'created_at' => $now, 'updated_at' => $now,
        ])->all();
        if ($rows) DB::table('notifications')->insert($rows);
    }
}
