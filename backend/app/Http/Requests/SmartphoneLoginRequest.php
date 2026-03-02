<?php

namespace App\Http\Requests;

use App\Models\Staff;
use Illuminate\Foundation\Http\FormRequest;

class SmartphoneLoginRequest extends FormRequest
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
        $staff = Staff::where('staff_id', $this->input('staff_id'))->first();
        $requiresUnits = $staff->user_type->value === \App\Enums\UserType::CARE_STAFF->value;
        return [
            'extension' => 'required|string|max:6',
            'staff_id' => 'required|numeric|max:999999',
            'password' => 'required|string|max:255',
            'unit_ids' => $requiresUnits ? 'required|array' : 'prohibited',
            'unit_ids.*' => 'string|exists:units,id', //uuids
        ];
    }

    public function messages(): array
    {
        return [
            'unit_ids.prohibited' => 'ユニットの指定は、できません。', //care_staff以外の場合
        ];
    }
}
