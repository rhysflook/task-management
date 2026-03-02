<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Requests\RegisterDeviceIdRequest;
use App\Http\Resources\ClientCollection;
use App\Http\Resources\ClientResource;
use App\Models\Client;
use App\Models\Heartbeat;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Requests\SmartphoneGetClientDataRequest;
use App\Models\Extension;
use App\Services\AsteriskAccountService;
use Illuminate\Support\Facades\DB;
class ClientController extends Controller
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
    public function show(Client $client)
    {
        return new ClientResource($client);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        //
    }
    public function smartphoneGetClientData(SmartphoneGetClientDataRequest $request)
    {
        \Log::info('Received smartphoneGetClientData request', ['device_id' => $request->device_id]);
        try {
            $client = Client::where('device_id', $request->device_id)
                ->first();
            if (!$client) {
                $staff = \App\Models\Staff::whereHas('extension', function ($query) use ($request) {
                    $query->where('number', $request->device_id);
                })->first();
                if ($staff) {
                    \Log::info('Device ID belongs to staff, not client', ['device_id' => $request->device_id]);
                    return response()->json([
                        'message' => 'Staff found',
                        "data" => [
                            'id' => $staff->staff_id,
                            'name' => $staff->name,
                            'user_type' => $staff->user_type->getLabel(),
                            "type" => "Staff"
                        ]
                    ]);
                }
                return response()->json([
                    'message' => 'Client or Staff not found'
                ], 404);
            }   
            \Log::info('Client found', ['client' => json_encode($client, JSON_PRETTY_PRINT)]);
            return response()->json([
                'message' => 'Client found',
                'data' => [
                    'bed_number'       => $client->bed?->bed_no,
                    'room_name'      => $client->bed?->room?->name,
                    'unit_name'        => $client->bed?->room?->unit?->name,
                    'patient_name'      => $client->bed?->patient?->name,
                    'patient_gender'    => $client->bed?->patient?->gender,
                    'type' => "PI"
                ]
            ]);

        } catch (\Throwable $e) {
            \Log::error('Error retrieving client data', [
                'device_id' => $request->device_id,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => 'Server error',
                'details' => $e->getMessage()
            ], 500);
        }
    }
    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->whereNull('bed_id')
    // }

    public function isAlive(Client $client)
    {
        $heartbeat = Heartbeat::where('device_id', $client->id)->first();
        if (!$heartbeat) return false;
        return $heartbeat->isAlive();
    }

    public function getAllIsAlive()
    {        
        $result = Heartbeat::all()->mapWithKeys(function ($heartbeat) {
            return [
                $heartbeat->device_id => $heartbeat->isAlive(),
            ];
        });

        // If no heartbeat -> not alive
        $clients = Client::all();
        foreach ($clients as $client) {
            if (!$result->has($client->device_id)) {
                $result[$client->id] = false;
            }
        }

        return $result;
    }

    public function registerDeviceId(RegisterDeviceIdRequest $request)
    {
        $device = DB::table('push_notification_devices')->where('unique_id', $request->unique_id)->first();
        if ($device) {
            DB::update('update push_notification_devices set device_id = ? where unique_id = ?', [
                $request->device_id,
                $request->unique_id,
            ]);

            return response()->json([
                'message' => 'Device updated successfully',
                'data' => [
                    'extension_number' => $device->extension,
                    'pass' => 'pass' . $device->extension,
                    'connection_ip' => '192.168.1.164',
                ],
            ], 200);
        }
        $account = AsteriskAccountService::createAccountForExtension();
    
        $device = DB::table('push_notification_devices')->insert([
            'extension' => $account['extension_number'],
            'device_id' => $request->device_id,
            'unique_id' => $request->unique_id,
        ]);

        return response()->json([
            'message' => 'Device registered successfully',
            'data' => $account,
        ], 201);
    }
}
