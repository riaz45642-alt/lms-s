<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worksheet extends Model
{
    use HasFactory;

    protected $fillable = [
        'created_by', 'teacher_id', 'title', 'description', 'subject', 'grade_level', 'instructions',
        'file_path', 'original_filename', 'mime_type', 'file_size',
        'default_total_marks', 'is_published',
        'default_due_days',
    ];

    protected $casts = [
        'default_total_marks' => 'decimal:2',
        'is_published' => 'boolean',
        'default_due_days' => 'integer',
    ];

    public function teacher()
    {
        return $this->belongsTo(TeacherProfile::class, 'teacher_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function bundles()
    {
        return $this->belongsToMany(WorksheetBundle::class, 'bundle_worksheet', 'worksheet_id', 'bundle_id')
            ->withPivot('position')
            ->withTimestamps();
    }

    public function assignments()
    {
        return $this->hasMany(WorksheetAssignment::class);
    }
}
