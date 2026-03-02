<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExampleResource extends JsonResource
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
            'name' => $this->name,
            'group' => $this->group,
        ];
    }

    /**
     * Static function to be called by an API to get groups.
     *
     * @return array
     */
    public static function getGroups()
    {
        return [
            ['id' => 1, 'name' => 'Group 1'],
            ['id' => 2, 'name' => 'Group 2'],
        ];
    }
}
