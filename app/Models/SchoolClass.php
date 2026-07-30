<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name', 'code', 'grade_level', 'academic_year', 'homeroom_teacher_id',
        'starts_on', 'ends_on', 'is_active',
    ];

    protected $casts = [
        'starts_on' => 'date',
        'ends_on' => 'date',
        'is_active' => 'boolean',
    ];

    public function homeroomTeacher()
    {
        return $this->belongsTo(TeacherProfile::class, 'homeroom_teacher_id');
    }

    public function students()
    {
        return $this->hasMany(StudentProfile::class, 'class_id');
    }

    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class, 'class_id');
    }

    public function teachers()
    {
        return $this->belongsToMany(
            TeacherProfile::class,
            'teaching_assignments',
            'class_id',
            'teacher_id'
        )->withPivot('subject_id')->withTimestamps();
    }

    public function subjects()
    {
        return $this->belongsToMany(
            Subject::class,
            'teaching_assignments',
            'class_id',
            'subject_id'
        )->withPivot('teacher_id')->withTimestamps();
    }
}
