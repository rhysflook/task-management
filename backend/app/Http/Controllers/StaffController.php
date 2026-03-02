<?php

namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Http\Requests\SmartphoneLoginRequest;
use App\Http\Requests\SmartphoneLogoutRequest;
use App\Http\Requests\StaffRequest;
use App\Http\Resources\StaffCollection;
use App\Http\Resources\StaffResource;
use App\Models\Staff;
use Exception;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Extension;

class StaffController extends Controller
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

    public function createRecord(StaffRequest $request)
    {
        return $this->handleTransaction(function () use ($request) {
            $data = array_merge($request->except('password'), [
                'password' => password_hash($request->password, PASSWORD_BCRYPT),
                'data_creator_id' => auth()->id(),
            ]);
            $staff = Staff::create($data);
            
            // Return with extra_data for next staff_id
            return [
                'record' => $staff,
                'extra_data' => $this->getExtraData()
            ];
        },  'Staff created successfully', 'Failed to create staff');
    }

    public function editRecord(Request $request)
    {
        return $this->handleTransaction(function() use ($request) {
            $modelName = $this->getModelName();
            $model = "App\\Models\\$modelName";
            $this->handleValidation($modelName, $request);

            // beforeCreate hook

            $record = tap($model::find($request->route('id')), function($record) use ($request) {
                $data = $request->all();
                
                if (empty($data['password'])) {
                    unset($data['password']);
                } else {
                    $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);
                }
                
                $record->update($data);
            });

            // beforeRelationshipCreation hook

            $this->handleRelationships($record, $request->input('relationships', []));
            return $record;
            // afterCreation hook
        },
            'Successfully updated record',
            'Failed to updated record',
        );
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
    public function show(Staff $staff)
    {
        return new StaffResource($staff);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Staff $staff)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Staff $staff)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Staff $staff)
    {
        //
    }

     public function canDeleteRecord(Request $request, Staff $staff)
    {
        if ($staff->units()->exists()) {
            return response()->json([
                'can_delete' => false,
                'message' => 'Cannot delete staff assigned to unit.'
            ]);
        } else {
            return response()->json([
                'can_delete' => true,
                'message' => 'Staff can be deleted.'
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
                if ($record->units()->exists()) {
                    $record->units()->detach();
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

    public function smartphoneLogin(SmartphoneLoginRequest $request) {
        return DB::transaction(function () use ($request) {
            try {
                $staff = Staff::where('staff_id', $request->staff_id)->first();
                if ($staff && password_verify($request->password, $staff->password)) {
                    if ($staff->units()->exists() || $staff->extension()->exists()) {
                        return response()->json(['error' => '別のスマホでログイン済み'], 409);
                    }
                    $staff->extension()->create(['number' => $request->extension]);
                    foreach ($request->unit_ids as $unit_id) {
                        $staff->units()->attach($unit_id);
                    }
                } else {
                    return response()->json(['error' => 'Unauthorized'], 401);
                }
                $staff->smartphoneLogins()->create();
                return response()->json(['message' => 'Login successful','staff_name' => $staff->name,'staff_units' => $staff->units]);
            } catch (Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        });
        
    }

    public function smartphoneLogout(SmartphoneLogoutRequest $request) {
        return DB::transaction(function () use ($request) {
            try {
                $staff = Staff::where('staff_id', $request->staff_id)->first();
    
                if ($staff) {
                    $staff->extension()->forceDelete();
                    foreach ($staff->units as $unit) {
                        $staff->units()->detach($unit->id);
                    }
                } else {
                    return response()->json(['error' => 'Unauthorized'], 401);
                }
                $staff->smartphoneLogins()->create(['type' => 'ログアウト']);
                return response()->json(['message' => 'Logout successful']);
            } catch (Exception $e) {
                return response()->json(['error' => $e->getMessage()], 500);
            }
        });
    }
    public function smartphoneGetStaffExtensionList(){
        try {
               $extensions = Extension::with('owner')
                ->where('owner_type', Staff::class)
                ->get()
                ->map(function ($extension) {
                    return [
                        'staff_name' => $extension->owner?->name,
                        'number'     => $extension->number,
                        'user_type' => $extension->owner->user_type,
                    ];
                });
            return response()->json([
                'success' => true,
                'data'    => $extensions
            ], 200);
        } catch (Exception $e) {
            \Log::error('Error fetching staff extensions: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getExtraData()
    {
        return ['next_staff_id' => Staff::generateStaffId()];
    }

    public function modifyTableQuery(Builder &$query)
    {
        $query->where('user_type', '!=', \App\Enums\UserType::SUPERUSER->value);
    }

    public function modifyUnitOptionQuery(Builder &$query)
    {
         $query->orderBy('unit_no');
    }

    // public function modifyUsersOptionQuery(Builder &$query)
    // {
    //     $query->where('is_active', true);
    // }
}
