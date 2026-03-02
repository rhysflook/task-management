<?php

namespace App\Http\Resources;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\Log;

class PatientCollection extends TableDataCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        $units = Unit::all()->pluck('name', 'id');
        $options = [];
        foreach ($units as $id => $name) {
            $options[] = [$id => $name];
        }

        return [
            'data' => $this->collection,
            'search_options' => [
                'unit_id' => $units, // Map unit_id to unit name for search options
            ],
            ...parent::toArray($request),
        ];
    }
}
