<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
       
        return [
            'id' => $this->id,
            'staff_id' => $this->staff_id,
            'name' => $this->name,
            'gender' => $this->gender,
            // 'password' => $this->password,
            'unit_id' => $this->unit_id,
            'data_creator_id' => $this->data_creator_id,
            'user_type' => $this->user_type,
        ];
    }
}
