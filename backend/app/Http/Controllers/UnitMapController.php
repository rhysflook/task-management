<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Resources\UnitMapCollection;
use App\Http\Resources\UnitMapResource;
use App\Models\Room;
use App\Models\Unit;
use App\Models\UnitMap;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UnitMapController extends Controller
{
    use HasTable, HasForm;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {   

        $data = ["data" => Unit::query()->with(['rooms'])->orderBy('unit_no')->get()->toArray()];
        return response()->json($data);
    }

    public function save(Request $request)
    {
        $receivedUnitIds = [];

        foreach ($request->get('floors') as $unit) {
            $the_unit = Unit::firstOrCreate(
                ['id' => $unit['id']], 
                ['id' => $unit['id'], 'name' => $unit['name'], 'unit_no' => '000']
            );
            $receivedUnitIds[] = $the_unit->id;
            
            $receivedRoomIds = [];
            
            foreach ($unit['rooms'] as $room) {
                Log::info($room);
                $found_room = Room::firstOrCreate(
                    ['id' => $room['id']],
                    [
                        'id' => $room['id'],
                        'unit_id' => $the_unit->id,
                        'number' => '000',
                        'name' => $room['name'] ?? '',
                        'extension' => '000',
                        'x' => $room['x'] ?? 0,
                        'y' => $room['y'] ?? 0,
                        'width' => $room['width'] ?? 200,
                        'height' => $room['height'] ?? 100,
                        'grid_rows' => $room['grid_rows'] ?? 1,
                        'grid_columns' => $room['grid_columns'] ?? 1,
                        'icon' => (isset($room['type']) && $room['type'] == 'facility') ? $room['kind'] : null,
                        'is_utility' => (isset($room['type']) && $room['type'] == 'facility') ? true : false,
                    ]
                );

                $found_room->update([
                    'x' => $room['x'] ?? 0,
                    'y' => $room['y'] ?? 0,
                    'width' => $room['width'] ?? 200,
                    'height' => $room['height'] ?? 100,
                    'grid_rows' => $room['grid_rows'] ?? 1,
                    'grid_columns' => $room['grid_columns'] ?? 1,
                ]);
                
                $receivedRoomIds[] = $found_room->id;

                if (isset($room['beds']) && is_array($room['beds'])) {
                    $receivedBedIds = collect($room['beds'])->pluck('id')->toArray();
                    
                    foreach ($room['beds'] as $bed) {
                        $found_room->beds()->firstOrCreate(
                            ['id' => $bed['id']],
                            [
                                'id' => $bed['id'],
                                'room_id' => $found_room->id,
                                'bed_no' => '000',
                                'name' => $bed['name'] ?? 'Bed',
                            ]
                        );
                    }
                    
                    $found_room->beds()->whereNotIn('id', $receivedBedIds)->delete();
                } else {
                    $found_room->beds()->delete();
                }
            }
            
            $the_unit->rooms()->whereNotIn('id', $receivedRoomIds)->delete();
        }
        
        Unit::whereNotIn('id', $receivedUnitIds)->delete();
        
        return response()->json(['message' => 'Unit map saved successfully']);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(UnitMap $unitMap)
    {
        return new UnitMapResource($unitMap);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(UnitMap $unitMap)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, UnitMap $unitMap)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(UnitMap $unitMap)
    {
        //
    }

    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->where('is_active', true);
    // }
}
