<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class StaffCollection extends TableDataCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->map(function ($item){
                $data = [
                    'id' => $item->id,
                    'staff_id' => $item->staff_id,
                    'name' => $item->name,
                    'gender' => $item->gender,
                    'password' => $item->password,
                    'user_type' => $item->user_type->getLabel(),
                ];
                return $data;
            }),
            ...parent::toArray($request),
        ];
    }
}
