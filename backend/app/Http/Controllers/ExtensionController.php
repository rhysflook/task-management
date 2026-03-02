<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Resources\ExtensionCollection;
use App\Http\Resources\ExtensionResource;
use App\Models\Extension;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ExtensionController extends Controller
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
    public function show(Extension $extension)
    {
        return new ExtensionResource($extension);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Extension $extension)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Extension $extension)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Extension $extension)
    {
        //
    }

    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->where('is_active', true);
    // }
}
