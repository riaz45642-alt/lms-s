<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('teacher') ?? false;
    }

    public function rules(): array
    {
        $checked = $this->input('status') === 'checked';

        return [
            'obtained_marks' => [Rule::requiredIf($checked), 'nullable', 'numeric', 'min:0', 'lte:total_marks'],
            'total_marks' => [Rule::requiredIf($checked), 'nullable', 'numeric', 'gt:0', 'max:999999.99'],
            'remarks' => ['nullable', 'string', 'max:10000'],
            'status' => ['required', Rule::in(['pending', 'checked'])],
            'teacher_comment' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
