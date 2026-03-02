<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ProvisionController extends Controller
{
    public function getDeviceId(): JsonResponse
    {
        try {
            $aor = DB::table('ps_endpoints as pe')
                ->leftJoin('clients as c', 'c.device_id', '=', 'pe.aors')
                ->whereNull('c.id')
                ->orderBy('pe.aors', 'asc')
                ->value('pe.aors');

            // dd($aor);

            if (!$aor) {
                return response()->json([
                    'error' => 'No free device_id'
                ], 404);
            }

            return response()->json([
                'username'    => $aor,
                'password'    => "pass{$aor}",
                'destination' => '3003',
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'error' =>  'Controller Exception',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // public function rasspiTest(): JsonResponse
    // {
    //     return response()->json([
    //         'message' => 'Raspberry Pi test endpoint is working!',
    //     ], 200);
    // }
}
