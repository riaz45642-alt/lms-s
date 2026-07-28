<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'student_number', 'date_of_birth', 'grade_level'];

    protected $casts = ['date_of_birth' => 'date'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parents()
    {
        return $this->belongsToMany(ParentProfile::class, 'parent_student', 'student_id', 'parent_id')
            ->withPivot('relationship')
            ->withTimestamps();
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
}
