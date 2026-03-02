<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Resources\UnitCollection;
use App\Http\Resources\UnitResource;
use App\Models\Unit;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class UnitController extends Controller
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
    public function show(Unit $unit)
    {
        return new UnitResource($unit);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Unit $unit)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Unit $unit)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Unit $unit)
    {
        //
    }

    public function canDeleteRecord(Request $request, Unit $unit)
    {
        if ($unit->staff()->exists()) {
            return response()->json([
                'can_delete' => false,
                'message' => 'Cannot delete unit with assigned staff.'
            ]);
        } else {
            return response()->json([
                'can_delete' => true,
                'message' => 'Unit can be deleted.'
            ]);
        }
    }

    public function deleteRecord(Request $request)
    {
        return $this->handleTransaction(function() use ($request) {
            $modelName = $this->getModelName();
            $model = "App\\Models\\$modelName";
            $record = $model::find($request->route('id'));
            if ($record) {
                // Delete all related rooms in a single query
                if ($record->staff()->exists()) {
                    $record->staff()->detach();
                }
                $record->delete();
                return response()->json(['message' => 'Record deleted successfully'], 200);
            }
            return response()->json(['message' => 'Record not found'], 404);
        },
            'Successfully deleted record',
            'Failed to delete record',
        );
    }

    public function listUnits() {
        return response()->json(Unit::query()->orderBy('unit_no')->pluck('name', 'id'));
    }
    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->where('is_active', true);
    // }
}
