<?php
use App\Http\Controllers\MoreExampleController;
use App\Http\Controllers\ExampleController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\BallController;
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

Route::post('/login', function (Request $request) {
	$request->validate([
		'email' => 'required|email',
		'password' => 'required',
	]);

	$credentials = $request->only('email', 'password');
	$token = auth()->attempt($credentials);
	if (!$token) {
		return response()->json(['error' => 'Unauthorized'], 401);
	}
	return response()->json(['token' => $token]);
});


Route::controller(ExampleController::class)->group(function() {
	Route::prefix('examples')->group(function() {
	Route::get('/formData', 'getFormData');
	Route::get('/{id}/edit', 'getFormData');
	Route::put('/{id}/save', 'EditRecord');
	Route::get('/{example}', 'show');
	Route::get('/{relationship}/options', 'getOptionsJson');
	Route::post('/create', 'createRecord');
	Route::delete('/{id}', 'deleteRecord');
});
})->middleware(['auth:sanctum']);

