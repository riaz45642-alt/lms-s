<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherProfile extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'employee_number', 'specialization'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function students()
    {
        return $this->belongsToMany(StudentProfile::class, 'teacher_student', 'teacher_id', 'student_id')
            ->withTimestamps();
    }

    public function worksheets()
    {
        return $this->hasMany(Worksheet::class, 'teacher_id');
    }

    public function bundles()
    {
        return $this->hasMany(WorksheetBundle::class, 'teacher_id');
    }

    public function reviews()
    {
        return $this->hasMany(TeacherReview::class, 'teacher_id');
    }

    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class, 'teacher_id');
    }

    public function classes()
    {
        return $this->belongsToMany(
            SchoolClass::class,
            'teaching_assignments',
            'teacher_id',
            'class_id'
        )->withPivot('subject_id')->withTimestamps();
    }

    public function subjects()
    {
        return $this->belongsToMany(
            Subject::class,
            'teaching_assignments',
            'teacher_id',
            'subject_id'
        )->withPivot('class_id')->withTimestamps();
    }

    public function assignmentsCreated()
    {
        return $this->hasManyThrough(
            WorksheetAssignment::class,
            User::class,
            'id',
            'assigned_by',
            'user_id',
            'id'
        );
    }
}
