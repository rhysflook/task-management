<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class UnitResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $staff = $this->staff;
        $data =  [
            'id' => $this->id,
            'name' => $this->name,
            'unit_no' => $this->unit_no ?? '100',

            'staff_id_1' => $staff[0]?->extension?->number ?? null,
            'staff_name_1' => $staff[0]?->name ?? null,

            'staff_id_2' => $staff[1]?->extension?->number ?? null,
            'staff_name_2' => $staff[1]?->name ?? null, 
            'staff_id_3' => $staff[2]?->extension?->number ?? null,
            'staff_name_3' => $staff[2]?->name  ?? null,
        ];
        Log::info($data);
        return $data;
    }
}
