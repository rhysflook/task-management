<?php

namespace App\Http\Resources;

use App\Enums\BedStatus;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {

       $isIndexPage = str_contains($request->getRequestUri(), '/tableData');
       $client_id = $this->client_id ? Client::find($this->client_id)->device_id : null; 

        return [
            'id' => $this->id,
            'number' => $this->number,
            'name' => $this->name,
            'unit_id' => $isIndexPage ? $this->unit->name : $this->unit_id,
            // 'patient_id' => $this->patient_id,
            'client_id' => $isIndexPage ? $client_id : $this->client_id,
            'bed_no' => $this->bed_no ?? null,
            'status' => ($isIndexPage && $this->status) ? BedStatus::from($this->status)->label() ?? null : $this->status,
        ];
    }
}
