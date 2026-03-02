<?php

namespace App\Http\Requests;

use App\Rules\FullWidthChars;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StaffRequest extends FormRequest
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
        $id = $this->route('id');
        $isEdit = $this->isMethod('put') || $this->isMethod('patch');
        return [
            'staff_id' => ['required', 'numeric', 'min:1000', 'max:9999', Rule::unique('staff')->ignore($id)],
            'name' => ['required', 'string', 'max:10', new FullWidthChars],
            'password' => [
                $isEdit ? 'nullable' : 'required',
                'string',
                'min:4',
                'max:4'
            ],
            'gender' => ['required']
        ];
    }

    public function attributes(): array
    {
        return [
            'name'    => 'スタッフ名',
        ];
    }
}
