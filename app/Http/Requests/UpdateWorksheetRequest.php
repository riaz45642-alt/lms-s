<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorksheetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'subject' => ['sometimes', 'required', 'string', 'max:100'],
            'grade_level' => ['sometimes', 'required', 'string', 'max:50'],
            'instructions' => ['nullable', 'string', 'max:10000'],
            'default_total_marks' => ['nullable', 'numeric', 'gt:0', 'max:999999.99'],
            'default_due_days' => ['nullable', 'integer', 'min:1', 'max:365'],
            'is_published' => ['sometimes', 'boolean'],
            'file' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:20480'],
        ];
    }
}
