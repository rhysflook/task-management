<?php

namespace App\Http\Requests;

use App\Rules\FullWidthChars;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UnitRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $unitId = $this->route('id');

        return [
            'unit_no' => [
                'required',
                'regex:/^\d{3}$/',
                Rule::unique('units')->ignore($unitId)->whereNull('deleted_at'),
            ],
            'name' => ['required', 'string', 'max:10', new FullWidthChars],
        ];
    }

    // Custom attribute names
    public function attributes(): array
    {
        return [
            'name'    => 'ユニット名',
        ];
    }
}
