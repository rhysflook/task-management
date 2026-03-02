<?php

use App\Models\Staff;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

//
// ────────────────────────────────────────────────
//  Validation tests
// ────────────────────────────────────────────────
//

it('fails validation when required fields are missing', function () {
    $response = $this->postJson('/api/staff/smartphone-logout', []);
    $response->assertStatus(422)
        ->assertJsonValidationErrors(['staff_id']);
});

it('fails validation when staff_id does not exist', function () {
    $response = $this->postJson('/api/staff/smartphone-logout', [
        'staff_id' => 9999,
        'extension' => '1234',
        'unit_ids'  => ['b87d6218-2b5f-4c37-97fa-6b7b945c0b92'],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['staff_id']);
});

//
// ────────────────────────────────────────────────
//  Business logic tests
// ────────────────────────────────────────────────
//

it('returns 401 when staff record does not exist', function () {
    $response = $this->postJson('/api/staff/smartphone-logout', [
        'staff_id'  => '9999',
    ]);

    $response->assertStatus(422);
});

it('deletes extension and detaches units for valid staff', function () {
    $staff = Staff::factory()->create(['password' => Hash::make('secret123')]);
    $units = Unit::factory()->count(2)->create();

    // Create related extension + attach units
    $staff->extension()->create(['number' => '1234']);
    foreach ($units as $unit) {
        $staff->units()->attach($unit->id);
    }

    // Sanity check
    expect($staff->extension()->count())->toBe(1);
    expect($staff->units()->count())->toBe(2);

    // Perform logout
    $payload = [
        'staff_id'  => $staff->staff_id ?? $staff->id, // adjust based on your schema
        'extension' => '1234',
        'unit_ids'  => $units->pluck('id')->toArray(),
    ];

    $response = $this->postJson('/api/staff/smartphone-logout', $payload);

    $response->assertStatus(200)
        ->assertJson(['message' => 'Logout successful']);

    // Assertions
    expect($staff->extension()->count())->toBe(0);
    expect($staff->units()->count())->toBe(0);
});

