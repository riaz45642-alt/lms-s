<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorksheetBundle extends Model
{
    use HasFactory;

    protected $fillable = ['teacher_id', 'title', 'description', 'is_published'];

    protected $casts = ['is_published' => 'boolean'];

    public function teacher()
    {
        return $this->belongsTo(TeacherProfile::class, 'teacher_id');
    }

    public function worksheets()
    {
        return $this->belongsToMany(Worksheet::class, 'bundle_worksheet', 'bundle_id', 'worksheet_id')
            ->withPivot('position')
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
