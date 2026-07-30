<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'code', 'description', 'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class);
    }

    public function teachers()
    {
        return $this->belongsToMany(
            TeacherProfile::class,
            'teaching_assignments',
            'subject_id',
            'teacher_id'
        )->withPivot('class_id')->withTimestamps();
    }

    public function classes()
    {
        return $this->belongsToMany(
            SchoolClass::class,
            'teaching_assignments',
            'subject_id',
            'class_id'
        )->withPivot('teacher_id')->withTimestamps();
    }
}
