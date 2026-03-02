<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class BedCollection extends TableDataCollection
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
                    'bed_no' => $item->bed_no,
                    'room_id' => $item->room->number,
                    'status' => $item->status,
                    'extension' => $item->extension,
                    // 'extension' => $item->extension->number,
                ];
                return $data;
            }),
            ...parent::toArray($request),
        ];
    }
}
