<?php

namespace App\Http\Resources;

use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class LogCollection extends TableDataCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection,
            'search_options' => [
                'unit_name' => Unit::all()->pluck('name')->mapWithKeys(fn($name) => [$name => $name]), // No search options for logs, but structure is kept for consistency
            ], // No search options for logs, but structure is kept for consistency
            ...parent::toArray($request),
        ];
    }
}
