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
    ];

    protected $casts = ['assigned_at' => 'datetime', 'due_at' => 'datetime'];

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
        return $this->hasOne(WorksheetSubmission::class, 'assignment_id');
    }
}
