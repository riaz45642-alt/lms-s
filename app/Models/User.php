<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'avatar_url',
        'password',
        'role',
        'status',
        'email_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected static function booted(): void
    {
        static::saved(function (User $user) {
            if (($user->wasRecentlyCreated || $user->wasChanged('role')) && Schema::hasTable('roles')) {
                $user->assignRole($user->role);
            }
        });
    }

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'user_roles')
            ->withPivot('assigned_by', 'assigned_at');
    }

    public function parentProfile()
    {
        return $this->hasOne(ParentProfile::class);
    }

    public function teacherProfile()
    {
        return $this->hasOne(TeacherProfile::class);
    }

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function assignmentsCreated()
    {
        return $this->hasMany(WorksheetAssignment::class, 'assigned_by');
    }

    public function submissionsUploaded()
    {
        return $this->hasMany(WorksheetSubmission::class, 'uploaded_by');
    }

    public function sentMessages()
    {
        return $this->hasMany(DirectMessage::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(DirectMessage::class, 'recipient_id');
    }

    public function assignRole(string|Role $role, ?User $assignedBy = null): void
    {
        $roleModel = $role instanceof Role
            ? $role
            : Role::query()->where('slug', $role)->first();

        if ($roleModel) {
            $this->roles()->syncWithoutDetaching([
                $roleModel->id => [
                    'assigned_by' => $assignedBy?->id,
                    'assigned_at' => now(),
                ],
            ]);
        }
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true)
            || $this->roles()->whereIn('slug', $roles)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', fn ($query) => $query->where('slug', $permission))
            ->exists();
    }

    public function portalPath(): ?string
    {
        return $this->roles()
            ->whereNotNull('portal_path')
            ->orderByDesc('priority')
            ->value('portal_path');
    }
}
