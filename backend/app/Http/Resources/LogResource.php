<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class LogResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'staff_name' => $this->staff_name,
            'extension' => $this->extension,
            'patient_name' => $this->patient_name,
            'data_kbn' => $this->data_kbn,
             'time_stamp'  => $this->time_stamp
            ? \Carbon\Carbon::parse($this->time_stamp, 'UTC')->setTimezone('Asia/Tokyo')->toDateTimeString()
            : null,
            'unit_name' => $this->unit_name,
            'room_name' => $this->room_name,
            'bed_no' => $this->bed_no,
        ];
    }
}
