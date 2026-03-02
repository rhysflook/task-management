<?php

use App\Events\CallEnded;
use App\Events\CallStarted;
use App\Http\Controllers\RingGroupController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ExtensionController;
use App\Http\Controllers\BedController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\ServerController;
use App\Http\Controllers\LogController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\UnitMapController;
use App\Http\Controllers\MoreExampleController;
use App\Http\Controllers\ExampleController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\BallController;
use App\Http\Controllers\ProvisionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
	return $request->user();
})->middleware(['auth:sanctum']);

Route::options('/_probe', function (\Illuminate\Http\Request $r) {
	return response()->json([
		'ACRM'   => $r->header('Access-Control-Request-Method'),
		'ACRH'   => $r->header('Access-Control-Request-Headers'),
		'ORIGIN' => $r->header('Origin'),
	], 200);
});

// Route::post('/login', function (Request $request) {
// 	$request->validate([
// 		'email' => 'required|email',
// 		'password' => 'required',
// 	]);

// 	$credentials = $request->only('email', 'password');
// 	$token = auth()->attempt($credentials);
// 	if (!$token) {
// 		return response()->json(['error' => 'Unauthorized'], 401);
// 	}
// 	return response()->json(['token' => $token]);
// });


Route::controller(ExampleController::class)->group(function () {
	Route::prefix('examples')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{example}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
		Route::get('/getGroups', 'getGroups');
	});
})->middleware(['auth:sanctum']);

Route::controller(UnitMapController::class)->group(function () {
	Route::prefix('unitMaps')->group(function () {
		Route::get('/', 'index');
		Route::post('/save', 'save');
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{unitMap}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);



Route::controller(PatientController::class)->group(function () {
	Route::prefix('patients')->group(function () {
		Route::get('/getStaged', 'getStagedPatients');
		Route::get('/getInCall', 'getInCallPatients');
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{patient}', 'show')->whereNumber('id');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::get('/{patient}/canDelete', 'canDeleteRecord');
		Route::delete('/{id}', 'deleteRecord');
		Route::post('/{patient}/setBed', 'setBed');
		Route::post('/{patient}/stage', 'stagePatient');
		Route::post('/{patient}/unstage', 'unstagePatient');
	});
})->middleware(['auth:sanctum']);



Route::controller(LogController::class)->group(function () {
	Route::prefix('logs')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{log}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);



Route::controller(UnitController::class)->group(function () {
	Route::prefix('units')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{unit}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::get('/{unit}/canDelete', 'canDeleteRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);



Route::controller(RoomController::class)->group(function () {
	Route::prefix('rooms')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{room}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::get('/{room}/canDelete', 'canDeleteRecord');
		Route::delete('/{id}', 'deleteRecord');
	})->middleware(['auth:sanctum']);
});
Route::controller(ServerController::class)->group(function () {
	Route::prefix('server')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{server}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);


Route::controller(StaffController::class)->group(function () {
	Route::prefix('staff')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{staff}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::get('/{staff}/canDelete', 'canDeleteRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);



Route::controller(BedController::class)->group(function () {
	Route::prefix('beds')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{bed}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);


Route::controller(ExtensionController::class)->group(function () {
	Route::prefix('extensions')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{extension}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);



Route::controller(ClientController::class)->group(function () {
	Route::prefix('clients')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{client}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
		Route::get('/check/allIsAlive', 'getAllIsAlive');
	});
})->middleware(['auth:sanctum']);



Route::controller(RingGroupController::class)->group(function () {
	Route::prefix('ringGroups')->group(function () {
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{ringGroup}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
	});
})->middleware(['auth:sanctum']);

Route::post('/staff/smartphone-login', [StaffController::class, 'smartphoneLogin']);
Route::post('/staff/smartphone-logout', [StaffController::class, 'smartphoneLogout']);
Route::get('/client/smartphone-getclientdata', [ClientController::class, 'smartphoneGetClientData']);
Route::post('/client/register-device-id', [ClientController::class, 'registerDeviceId']);

Route::get('/deviceid', [ProvisionController::class, 'getDeviceId']);

Route::post('/call-started', function (Request $request) {
	\Log::info('CallStarted API endpoint hit', ['request' => $request->all()]);
	$request->validate([
		'patientId' => 'required|integer',
	]);
	CallStarted::dispatch($request->input('patientId'));
	return response()->json(['status' => 'CallStarted event broadcasted']);
});

Route::post('/call-ended', function (Request $request) {
	$request->validate([
		'patientId' => 'required|integer',
	]);
	CallEnded::dispatch($request->input('patientId'));
	return response()->json(['status' => 'CallEnded event broadcasted']);
});

Route::get('/client/smartphone-getstaffdata', [StaffController::class, 'smartphoneGetStaffExtensionList']);

Route::get('/units', [UnitController::class, 'listUnits']);

Route::get('/apk-version', function () {
	$versionInfo = json_decode(file_get_contents(base_path('routes/version.json')), true);
	return response()->json($versionInfo);
});

Route::get('/downloads/android-apk', function () {
	$apkPath = storage_path('app/apk/nursecall-mobile-debug.apk');

	if (!file_exists($apkPath)) {
		abort(404, 'APK file not found');
	}

	return response()->download(
		$apkPath,
		'nursecall-mobile-debug.apk',
		['Content-Type' => 'application/vnd.android.package-archive']
	);
});
