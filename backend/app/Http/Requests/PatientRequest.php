<?php

namespace App\Http\Requests;

use App\Enums\PatientStatus;
use App\Models\Patient;
use App\Rules\FullWidthChars;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PatientRequest extends FormRequest
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
        $previousSection = $id ? Patient::query()->whereKey($id)->value('section') : null;
        $isSectionChangingFromOutingToAdmission =
            (int) $previousSection === PatientStatus::OUTING->value &&
            (int) $this->input('section') === PatientStatus::ADMITTED->value;
        
        $isSectionChangingFromAdmissionToOuting =
            (int) $previousSection === PatientStatus::ADMITTED->value &&
            (int) $this->input('section') === PatientStatus::OUTING->value;

        return [
            'patient_no' => ['required', 'regex:/^\d{6}$/', Rule::unique('patients')->ignore($id)->whereNull('deleted_at')->whereNull('discharge_day')], 
            'name' => ['required', 'string', 'max:10', new FullWidthChars],
            'kana' => ['required', 'string', 'max:12', new FullWidthChars],
            'birth_day' => ['required', 'date'],
            'gender' => ['required'],
            'unit_id' => ['required'],
            'room_id' => ['required'],
            'bed_id' => [request()->getMethod() === 'POST' ? 'required' : 'nullable'],
            'section' => ['required'],
            // 'outing_start' => [
            //     'required_if:section,3',
            //     Rule::prohibitedIf(
            //         !$isSectionChangingFromAdmissionToOuting && !$isSectionChangingFromOutingToAdmission
            //     ),
            // ],
            // 'outing_end' => [
            //     Rule::requiredIf(
            //         $isSectionChangingFromOutingToAdmission
            //     ),
            //     Rule::prohibitedIf(
            //         !$isSectionChangingFromOutingToAdmission
            //     ),
            // ],
            'admission_day' => ['required_if:section,2', 'date'],
            'discharge_day' => ['required_if:section,4'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => '姓名',
        ];
    }

    public function messages(): array
    {
        return [
            'admission_day.required_if' => '入所区分が「入所」の場合、入所日は必須です。',
            'outing_start.required_if' => '入所者区分が「外出」の場合、外出開始日時は必須です。',
            'outing_start.prohibited' => '外出開始日時は「入所」から「外出」に変更する場合のみ指定できます。',
            'outing_end.required_if' => '外出終了日時を指定してください。',
            'outing_end.prohibited' => '外出終了日時は「外出」から「入所」に変更する場合のみ指定できます。',
            'discharge_day.required_if' => '入所者区分が「退所」の場合、退院日は必須です。',
        ];
    }
}
