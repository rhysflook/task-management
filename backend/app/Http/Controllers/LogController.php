<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Resources\LogCollection;
use App\Http\Resources\LogResource;
use App\Models\Log;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class LogController extends Controller
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
    public function show(Log $log)
    {
        return new LogResource($log);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Log $log)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Log $log)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Log $log)
    {
        //
    }

    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->where('is_active', true);
    // }
}
