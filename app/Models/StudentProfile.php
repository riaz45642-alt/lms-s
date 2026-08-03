<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'parent_id', 'class_id', 'student_number', 'date_of_birth', 'grade_level'];

    protected $casts = ['date_of_birth' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function parent()
    {
        return $this->belongsTo(ParentProfile::class, 'parent_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(TeacherProfile::class, 'teacher_student', 'student_id', 'teacher_id')
            ->withTimestamps();
    }

    public function assignments()
    {
        return $this->hasMany(WorksheetAssignment::class, 'student_id');
    }

    public function reports()
    {
        return $this->hasMany(PerformanceReport::class, 'student_id');
    }

    public function submissions()
    {
        return $this->hasManyThrough(
            WorksheetSubmission::class,
            WorksheetAssignment::class,
            'student_id',
            'assignment_id'
        );
    }
}
