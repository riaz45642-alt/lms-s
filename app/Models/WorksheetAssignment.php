<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorksheetAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'worksheet_id', 'student_id', 'assigned_by', 'instructions',
        'assigned_at', 'due_at', 'status',
        'allow_resubmission', 'allow_late_submission',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'due_at' => 'datetime',
        'allow_resubmission' => 'boolean',
        'allow_late_submission' => 'boolean',
    ];

    public function worksheet()
    {
        return $this->belongsTo(Worksheet::class);
    }

    public function student()
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function submission()
    {
        return $this->hasOne(WorksheetSubmission::class, 'assignment_id')->latestOfMany('attempt_number');
    }

    public function submissions()
    {
        return $this->hasMany(WorksheetSubmission::class, 'assignment_id')->orderByDesc('attempt_number');
    }
}
