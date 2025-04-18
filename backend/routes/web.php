<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/api/test', [App\Http\Controllers\API\TestController::class, 'index']);
Route::controller(ProjectController::class)->group(function() {
	Route::prefix('api/projects')->group(function() {
		// Route::get('tableData', 'getPage');
		// Route::get('/', 'index');
		// Route::get('/{project}', 'show');
		// Route::post('/', 'store');
		// Route::put('/{project}', 'update');
		// Route::delete('/{project}', 'destroy');
	});
});
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

