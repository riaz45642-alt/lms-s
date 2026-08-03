<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorksheetSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'assignment_id', 'attempt_number', 'uploaded_by', 'file_path', 'original_filename',
        'mime_type', 'file_size', 'student_note', 'submitted_at',
    ];

    protected $casts = ['attempt_number' => 'integer', 'submitted_at' => 'datetime'];

    public function assignment()
    {
        return $this->belongsTo(WorksheetAssignment::class, 'assignment_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function review()
    {
        return $this->hasOne(TeacherReview::class, 'submission_id');
    }
}
