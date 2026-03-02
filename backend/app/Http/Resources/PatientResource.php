<?php

namespace App\Http\Resources;

use App\Enums\PatientStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Unit;
use Illuminate\Support\Facades\Log;

class PatientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isIndexPage = str_contains($request->getRequestUri(), '/tableData');
        return [
            'id' => $this->id,
            'patient_no' => $this->patient_no,
            'name' => $this->name,
            'kana' => $this->kana,
            'birth_day' =>$this->birth_day,
            'gender' => $this->gender,
            'unit_id' => $isIndexPage ? $this->unit?->name : $this->unit_id,
            'room_id' => $isIndexPage ? $this->room?->name : $this->room_id,
            'bed_id' => $isIndexPage ? $this->bed?->name : $this->bed_id,
            'section' => $isIndexPage ? PatientStatus::from($this->section)->label() : $this->section,
            'outing_start' => $this->section == PatientStatus::OUTING->value ? $this->patientOutings()->latest()->first()?->outing_start : null,
            'outing_end' => $this->section == PatientStatus::OUTING->value ? $this->patientOutings()->latest()->first()?->outing_end : null,
            'admission_day' => ($this->section == PatientStatus::DISCHARGED->value || $this->section == PatientStatus::VACANT->value) ? null : $this->admission_day,
            'discharge_day' => $this->section == PatientStatus::DISCHARGED->value ? $this->discharge_day : null,
        ];
        
    }
}
