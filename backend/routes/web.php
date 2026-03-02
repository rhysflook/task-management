<?php

use App\Enums\UserType;
use App\Http\Controllers\ProjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
Route::get('/_cors_debug', function () {
    return response()->json(config('cors'));
});
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

Route::get('/login', function() {
    return redirect('/');
});

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'staff_id' => ['required', 'integer'],
        'password' => ['required'],
    ]);
	$user = \App\Models\Staff::where('staff_id', $credentials['staff_id'])->first();
	if (!$user) {
		return response()->json(['message' => 'Invalid credentials'], 422);
	}
    // Attempt session-based login; 'remember' = true to persist session if desired.
	if ($user->user_type == UserType::NURSE) {
		return response()->json(['message' => 'Unauthorized user type', 'status' => 403], 403);
	}

    if (!Auth::attempt($credentials, true)) {
        return response()->json(['message' => 'Invalid credentials'], 422);
    }


    // Regenerate session ID to prevent fixation.
    $request->session()->regenerate();
    return response()->json(['message' => 'Logged in', 'user_type' => $user->user_type->value], 200);
});

Route::post('/logout', function (Request $request) {
    // Explicitly log out the 'web' guard and invalidate session.
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return response()->noContent();
});

Route::get('/downloads/android-apk', function () {
    $apkPath = storage_path('app/apk/nursecall-mobile-debug.apk');
	\Log::info('APK download requested', ['apk_path' => $apkPath]); // Log the download request and path
    if (!file_exists($apkPath)) {
        abort(404, 'APK file not found');
    }

    return response()->download(
        $apkPath,
        'nursecall-mobile-debug.apk',
        ['Content-Type' => 'application/vnd.android.package-archive']
    );
})->name('downloads.android-apk');
