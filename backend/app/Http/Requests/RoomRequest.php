<?php

namespace App\Http\Requests;

use App\Rules\FullWidthChars;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RoomRequest extends FormRequest
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
        return [
            'unit_id' => ['required'],
            'number' => [
                'required',
                'regex:/^\d{3}$/',
                Rule::unique('rooms')->ignore($this->route('id'))->whereNull('deleted_at'),
            ],
            'name' => ['required', 'string', 'max:10', new FullWidthChars],
            'beds' => ['required', 'array', 'min:1'],
            'beds.*.bed_no' => [
                'required_unless:beds.*.is_blank,true',
                  function ($attribute, $value, $fail) {

        // Extract the bed index from "beds.2.bed_no"
                    preg_match('/beds\.(\d+)\./', $attribute, $m);
                    $i = $m[1] ?? null;

                    $bed = $this->input("beds.$i");

                    // Skip if is_blank
                    if ($bed['is_blank'] ?? false) {
                        return; // stop, do NOT validate further
                    }


                    // Now apply your validation
                    if (!preg_match('/^\d{2}$/', $value)) {
                        return $fail('ベッドNo.は2桁の数字で入力してください。');
                    }

                    // Check duplicates
                    $bedNos = array_column($this->input('beds', []), 'bed_no');
                    if ($value !== null && count(array_keys($bedNos, $value)) > 1) {
                        return $fail('同じ部屋内でベッドNo.は重複できません。');
                    }
                },
            ],
            // 'beds.*.extension' => ['required_unless:beds.*.is_blank,true'],
        ];
    }

    public function attributes()
    {
        return [
            'name' => '部屋名',
            'number' => '部屋No.',
            'beds' => 'ベッド',
            'beds.*.bed_no' => 'ベッドNo.',
            'beds.*.client_id' => '№内線',
        ];
    }

    public function messages()
    {
        return [
            'number.regex' => '部屋No.は3桁の数字で入力してください。',
            'beds.*.bed_no.regex' => 'ベッドNo.は2桁の数字で入力してください。',
            'beds.*.bed_no.required_unless' => 'ベッドNo.を入力してください。',
            'beds.*.client_id.required_unless' => '№内線を選択してください。',
        ];
    }   
}
