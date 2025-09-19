<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware(['auth:sanctum']);

Route::controller(ProjectController::class)->group(function() {
	Route::prefix('projects')->group(function() {
		// Route::get('tableData', 'getPage');
		// Route::get('/', 'index');
		Route::get('/formData', 'getFormData');
		Route::get('/{id}/edit', 'getFormData');
		Route::put('/{id}/save', 'EditRecord');
		Route::get('/{project}', 'show');
		Route::get('/{relationship}/options', 'getOptionsJson');
		Route::post('/create', 'createRecord');
		Route::delete('/{id}', 'deleteRecord');
		// Route::put('/{project}', 'update');
		// Route::delete('/{project}', 'destroy');
	});
})->middleware(['auth:sanctum']);