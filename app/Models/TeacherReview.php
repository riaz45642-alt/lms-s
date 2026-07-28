<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id', 'teacher_id', 'obtained_marks', 'total_marks',
        'percentage', 'remarks', 'status', 'checked_at',
    ];

    protected $casts = [
        'obtained_marks' => 'decimal:2',
        'total_marks' => 'decimal:2',
        'percentage' => 'decimal:2',
        'checked_at' => 'datetime',
    ];

    public function submission()
    {
        return $this->belongsTo(WorksheetSubmission::class, 'submission_id');
    }

    public function teacher()
    {
        return $this->belongsTo(TeacherProfile::class, 'teacher_id');
    }

    public function report()
    {
        return $this->hasOne(PerformanceReport::class, 'review_id');
    }
}
