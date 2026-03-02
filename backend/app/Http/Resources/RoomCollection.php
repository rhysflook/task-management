<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class RoomCollection extends TableDataCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    // public function toArray(Request $request): array
    // {
    //     return [
    //         'data' => $this->collection->map(function ($item){
    //             $data = [
    //                 'id' => $item->id,
    //                 'number' => $item->number,
    //                 'name' => $item->name,
    //                 'unit_id' => $item->unit?->name,
    //                 // 'extension' => $item->extension
    //             ];
    //             return $data;
    //         }),
    //         ...parent::toArray($request),
    //     ];
    // }
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            ...parent::toArray($request),
        ];
    }
}
