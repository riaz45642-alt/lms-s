<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('parent', 'admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'worksheet_id' => ['required', 'integer', 'exists:worksheets,id'],
            'student_id' => ['required', 'integer', 'exists:student_profiles,id'],
            'instructions' => ['nullable', 'string', 'max:10000'],
            'due_at' => ['nullable', 'date', 'after:now'],
            'allow_resubmission' => ['sometimes', 'boolean'],
            'allow_late_submission' => ['sometimes', 'boolean'],
        ];
    }
}
