<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/debug-stateful', function () {
    return config('sanctum.stateful');
});

Route::middleware('web')->get('/test-session', function (Request $request) {
    return [
        'user' => $request->user(),
        'session' => session()->all(),
    ];
});

Route::get('/api/test', [App\Http\Controllers\API\TestController::class, 'index']);

Route::get('/api/projects/all', function () {
	return response()->json([
		'projects' => [
			[
				['id' => 1,
				'value' => 'Underworks',
				'created_at' => now(),
				'updated_at' => now(),],
				['id' => 2,
				'value' => 'POWERBI dashboard integrations',
				'created_at' => now(),
				'updated_at' => now(),],
				['id' => 3,
				'value' => 'UNW',
				'created_at' => now(),
				'updated_at' => now(),]
			],
			[
				['id' => 4,
				'value' => 'IBS',
				'created_at' => now(),
				'updated_at' => now(),],
				['id' => 5,
				'value' => 'Phone System',
				'created_at' => now(),
				'updated_at' => now(),],
				['id' => 6,
				'value' => 'IBS',
				'created_at' => now(),
				'updated_at' => now(),],
			],
		],
	]);
});

