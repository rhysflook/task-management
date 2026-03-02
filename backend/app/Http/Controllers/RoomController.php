<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Enums\BedStatus;
use App\Http\Requests\RoomRequest;
use App\Http\Resources\RoomCollection;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Models\Bed;
use App\Models\Client;
use App\Services\RoomLayoutService;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    use HasTable, HasForm;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function createRecord(RoomRequest $request)
    {
        return $this->handleTransaction(function () use ($request) {

            // Create Room
            $this->handleValidation("Room", $request);
            $room = Room::create($request->all());
            // $this->handleRelationships($room, $request->input('relationships', []));
            // Create Beds
            $bedsData = $request->input('beds', []);
            foreach ($bedsData as $i => $bedData) {
                if (!empty($bedData['is_blank']) && $bedData['is_blank']) {
                    continue;
                }
                // $this->handleValidation("Bed", $request);
                if (!empty($bedData['client_id'])) {
                    $client = Client::findOrFail($bedData['client_id']);
                } else {
                    $client = null;
                }
                $bed = $room->beds()->create([
                    'bed_no' => $bedData['bed_no'],
                    'status' => 1,
                    'client_id' => $bedData['client_id'] ?? null,
                    'position' => $i + 1
                ]);
                if (!empty($bedData['client_id'])) {
                    // $extension = $bed->extension()->create([
                    //     'owner_type' => Client::class,
                    //     'owner_id' => $client->id,
                    //     'number' => $client->device_id,
                    // ]);
                    $client->update([
                        'bed_id' => $bed->id,
                    ]);
                }
            }
            $roomDimensions = new RoomLayoutService();
            $positions = [];
            foreach ($room->beds as $bed) {
               $positions[] = $bed->position;
            }
            $room->update($roomDimensions->compute($positions, $room->unit_id, $room->id));
            return [
                'record' => $room,
                'extra_data' => $this->getExtraData()
            ];
        },  '部屋の作成に成功しました', '部屋の作成に失敗しました');
    }

    public function getFormData(Request $request)
    {
        $id = $request->route('id'); // Retrieve 'id' from route parameters
        $resourceClass = 'App\\Http\\Resources\\' . $this->getModelName() . 'Resource';
        $modelClass = 'App\\Models\\' . $this->getModelName();

        $record = $id
            ? new $resourceClass($modelClass::find($id))
            : null;
        $beds = $record ? $record->beds : [];
        if ($beds) {
            $this->modifyFormDataRecord($record);
            foreach ($beds as $bed) {
                $bed->client_id = $bed->client?->id; // Load extension relationship
            }
        }
        return response()->json([
            'data' => [
                'id' => $id,
                'options' => $this->getRelationshipOptions($request),
                'record' => $record,
                'beds' => $record ? $record->beds : [],
                'extra_data' => $this->getExtraData(),
            ],
        ]);
    }

    public function editRecord(Request $request)
    {
        return $this->handleTransaction(function () use ($request) {

            $room = Room::findOrFail($request->route('id'));

            /*
            |--------------------------------------------------------------------------
            | Update room fields
            |--------------------------------------------------------------------------
            */
            $this->handleValidation('Room', $request);
            $room->update($request->all());

            /*
            |--------------------------------------------------------------------------
            | Prepare data (capture current state BEFORE changes)
            |--------------------------------------------------------------------------
            */
            $bedsData = $request->input('beds', []);

            // Load current beds + their current client assignment (if any)
            $bedsBefore = $room->beds()->with('client')->get();

            // Existing beds keyed by id (for update tracking)
            $existingBeds = $bedsBefore->keyBy('id');

            // Clients currently assigned to ANY bed in this room (before applying request)
            $currentlyAssignedClientIds = $bedsBefore
                ->pluck('client.id')
                ->filter()
                ->unique()
                ->values();

            // bed_id => client_id (or null) desired after update
            $desiredAssignments = [];

            /*
            |--------------------------------------------------------------------------
            | Update existing beds / create new beds
            |--------------------------------------------------------------------------
            */
            foreach ($bedsData as $i => $bedData) {
                if (!empty($bedData['is_blank'])) {
                    continue;
                }

                /*
                |--------------------------------------------------------------
                | Existing bed
                |--------------------------------------------------------------
                */
                if (!empty($bedData['id']) && $existingBeds->has($bedData['id'])) {
                    $bed = $existingBeds[$bedData['id']];

                    unset($bedData['id']);

                    $bed->update(array_merge(
                        $bedData,
                        ['position' => $i + 1]
                    ));

                    // Record desired client assignment (may be null => unassigned)
                    $desiredAssignments[$bed->id] = $bedData['client_id'] ?? null;

                    // Mark as processed (remaining ones get deleted)
                    $existingBeds->forget($bed->id);
                    continue;
                }

                /*
                |--------------------------------------------------------------
                | New bed
                |--------------------------------------------------------------
                */
                $bed = $room->beds()->create(array_merge(
                    $bedData,
                    [
                        'status'   => BedStatus::AVAILABLE->value,
                        'position' => $i + 1,
                    ]
                ));

                $desiredAssignments[$bed->id] = $bedData['client_id'] ?? null;
            }

            /*
            |--------------------------------------------------------------------------
            | Delete removed beds (and remember their previously assigned clients)
            |--------------------------------------------------------------------------
            */
            $deletedBedsClientIds = $existingBeds
                ->pluck('client.id')
                ->filter()
                ->unique()
                ->values();

            foreach ($existingBeds as $bed) {
                $bed->delete();
            }

            /*
            |--------------------------------------------------------------------------
            | Resolve client ↔ bed assignments (swap-safe + unassign-safe)
            |--------------------------------------------------------------------------
            | Clear:
            | - clients that were assigned before (even if now unassigned everywhere)
            | - clients requested in payload
            | - clients that were on deleted beds
            |--------------------------------------------------------------------------
            */
            $desiredClientIds = collect($desiredAssignments)
                ->filter()   // keep non-null only
                ->unique()
                ->values();

            $clientsToClear = $currentlyAssignedClientIds
                ->merge($deletedBedsClientIds)
                ->merge($desiredClientIds)
                ->unique()
                ->values();

            if ($clientsToClear->isNotEmpty()) {
                $clients = Client::whereIn('id', $clientsToClear)->get()->keyBy('id');

                // Clear all involved clients first (swap-safe and unassign-safe)
                foreach ($clients as $client) {
                    $client->update(['bed_id' => null]);
                }

                // Apply final desired assignments
                foreach ($desiredAssignments as $bedId => $clientId) {
                    if (!$clientId) {
                        continue; // explicitly unassigned
                    }

                    if (!isset($clients[$clientId])) {
                        // If desired client wasn't in $clientsToClear for some reason,
                        // fetch it to avoid silent failure.
                        $clients[$clientId] = Client::findOrFail($clientId);
                    }

                    $clients[$clientId]->update([
                        'bed_id' => $bedId,
                    ]);
                }
            }

            // Handle Room dimensions after update
            $roomDimensions = new RoomLayoutService();
            $positions = [];
            // Reload beds relation (without that $room->beds is a not updated reference)
            $room->load('beds');
            foreach ($room->beds as $bed) {
               $positions[] = $bed->position;
            }
            $room->update($roomDimensions->compute($positions, $room->unit_id, $room->id));

            return $room;

        }, '部屋の更新に成功しました', '部屋の更新に失敗しました');
    }

    public function canDeleteRecord(Request $request, Room $room)
    {
        if ($room) {
            if ($room->whereHas('beds', fn ($query) => $query->whereIn('status', [
                    BedStatus::OCCUPIED->value, BedStatus::OUTING->value
                ]))->count() > 0) {
                return response()->json(['message' => 'この部屋は削除できません。'], 200);
            }
            return response()->json(['message' => 'この部屋は削除可能です。'], 200);
        }
        return response()->json(['message' => 'Record not found'], 404);
    }

    public function deleteRecord(Request $request)
    {
        return $this->handleTransaction(function () use ($request) {
            $room = Room::find($request->route('id'));
            if ($room) {
                foreach ($room->beds as $bed) {
                    if ($bed->client) {
                        $bed->client()->update([
                            'bed_id' => null,
                            'extension_id' => null,
                        ]);

                    }
                    if ($bed->patient) {
                        $bed->patient()->update([
                            'bed_id' => null,
                        ]);
                    }
                    $bed->delete();
                }

                $room->delete();
                return $room;
            }
            return response()->json(['message' => 'Record not found'], 404);
        }, '部屋の削除に成功しました', '部屋の削除に失敗しました');
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
    public function show(Room $room)
    {
        return new RoomResource($room);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Room $room)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Room $room)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Room $room)
    {
        //
    }

    public function modifyClientOptionQuery(Builder &$query)
    {
        $id = request()->get('record');

        $query->whereNull('bed_id')->orWhereHas('bed', function ($q) use ($id) {
            $q->where('room_id', $id);
        });
    }

    public function modifyUnitOptionQuery(Builder &$query)
    {
        $query->orderBy('unit_no');
    }

    public function modifyTableQuery(Builder &$query)
    {
        $query->leftJoin('units', 'rooms.unit_id', '=', 'units.id')
              ->leftJoin('beds', 'rooms.id', '=', 'beds.room_id')
              ->select('rooms.*', 'beds.bed_no', 'beds.client_id', 'beds.status')
              ->where(function ($q) {
                  $q->whereNull('beds.deleted_at');
              })
              ->where('rooms.number', '<>', '000');
    }

    public function modifyTableQueryOrder(Builder &$query)
    {
        $query->orderBy('units.unit_no')
              ->orderBy('rooms.name')
              ->orderBy('beds.bed_no');
    }

    public function modifyFormDataRecord($record)
    {
           // Convert relationship collection to array we can manipulate
        $beds = $record->beds->toArray();

        // 1. Extract current positions
        $positions = array_column($beds, 'position');
        $maxPos = !empty($positions) ? max($positions) : 0;

        // 2. Insert missing blank beds
        for ($pos = 1; $pos <= $maxPos; $pos++) {
            $exists = collect($beds)->firstWhere('position', $pos);

            if (!$exists) {
                $beds[] = [
                    'id'         => "blank-$pos",
                    'bed_no'     => '',
                    'client_id'  => null,
                    'status'     => '1',
                    'is_blank'   => true,
                    'position'   => $pos,
                    'client'     => null,
                ];
            }
        }

        // 3. Sort by position
        usort($beds, fn($a, $b) => $a['position'] <=> $b['position']);

        // 4. Map extension = client->id (if a real bed)
        $beds = array_map(function ($bed) {
            if (!empty($bed['is_blank'])) {
                return $bed;
            }

            // Eloquent relation was converted, so client is an array
            $bed['client_id'] = $bed['client']['id'] ?? null;

            return $bed;
        }, $beds);

        // 5. Replace original relation data with enriched array
        $record->beds = $beds;
        return $record;
    }

    public function getExtraData()
    {
        return ['next_room_no' => Room::generateRoomNo()];
    }
}
