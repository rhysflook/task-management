<?php

namespace App\Services;

class RoomLayoutService
{
    public function compute(array $beds, string $unitId, string $currentRoomId): array
    {
        // Environment variable defaults
        $bedWidth  = (int) env('VITE_BED_WIDTH', 200);
        $bedHeight = (int) env('VITE_BED_HEIGHT', 100);

        // Normalize bed numbers
        $beds = array_map('intval', $beds);

        // -----------------------------
        // Determine grid rows
        // -----------------------------
        $hasTwoRowBed = $this->containsAny($beds, [4, 5, 6]);
        $gridRows = $hasTwoRowBed ? 2 : 1;

        // -----------------------------
        // Determine grid columns (priority)
        // -----------------------------
        if ($this->containsAny($beds, [3, 4, 5, 6])) {
            $gridCols = 3;
        } elseif ($this->containsAny($beds, [2])) {
            $gridCols = 2;
        } else {
            $gridCols = 1;
        }

        // Final computed dimensions
        $width = $bedWidth * $gridCols;
        $height = $bedHeight * $gridRows;

        $unit = \App\Models\Unit::find($unitId);
        $otherRooms = $unit->rooms()->where("id", '<>', $currentRoomId)->orderBy('y')->orderBy('x')->get();
 
        if ($otherRooms->isEmpty()) {
            $x = 0;
            $y = 0;
        } else if ($otherRooms->last()->x + $otherRooms->last()->width < 5 * $bedWidth) {
            $x = $otherRooms->last()->x + $otherRooms->last()->width;
            $y = $otherRooms->last()->y;
        } else {
            $x = 0;
            $y = $otherRooms->max(fn($room) => $room->y + $room->height);
        }
        return [
            'grid_rows' => $gridRows,
            'grid_columns' => $gridCols,
            'width'     => $width,
            'height'    => $height,
            'x'         => $x,
            'y'         => $y,
        ];
    }

    private function containsAny(array $source, array $targets): bool
    {
        return count(array_intersect($source, $targets)) > 0;
    }
}
