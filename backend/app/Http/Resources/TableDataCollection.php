<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TableDataCollection extends ResourceCollection
{

    private $usePagination = true;
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    public function toArray(Request $request): array
    {
        if (!$this->usePagination) {
            return [];
        }
        
        return [
            'links' => [
                'self' => $this->path(),
                'next' => $this->nextPageUrl(),
                'prev' => $this->previousPageUrl(),
            ],
            'meta' => [
                'total' => $this->total(),
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'per_page' => $this->perPage(),
            ],
        ];
    }

    public function withPagination(bool $value): self
    {
        $this->usePagination = $value;
        return $this;
    }
}
