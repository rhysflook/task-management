<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Resources\RingGroupCollection;
use App\Http\Resources\RingGroupResource;
use App\Models\RingGroup;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class RingGroupController extends Controller
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
    public function show(RingGroup $ringGroup)
    {
        return new RingGroupResource($ringGroup);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(RingGroup $ringGroup)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RingGroup $ringGroup)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RingGroup $ringGroup)
    {
        //
    }

    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->where('is_active', true);
    // }
}
