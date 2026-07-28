<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'review_id', 'overall_grade', 'progress', 'teacher_comment',
    ];

    protected $casts = ['progress' => 'decimal:2'];

    public function student()
    {
        return $this->belongsTo(StudentProfile::class, 'student_id');
    }

    public function review()
    {
        return $this->belongsTo(TeacherReview::class, 'review_id');
    }
}
