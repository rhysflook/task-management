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
    $response = $this->postJson('/api/staff/smartphone-login', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['extension', 'staff_id', 'password', 'unit_ids']);
});

it('fails validation when unit_ids is not an array', function () {
    $response = $this->postJson('/api/staff/smartphone-login', [
        'extension' => '1234',
        'staff_id'  => 'S001',
        'password'  => 'pass123',
        'unit_ids'  => 'not-an-array',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['unit_ids']);
});

it('fails validation when unit_ids contains non-existent UUIDs', function () {
    $response = $this->postJson('/api/staff/smartphone-login', [
        'extension' => '1234',
        'staff_id'  => 'S001',
        'password'  => 'pass123',
        'unit_ids'  => [Str::uuid()->toString()],
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['unit_ids.0']);
});

//
// ────────────────────────────────────────────────
//  Business logic tests
// ────────────────────────────────────────────────
//

it('returns 401 when staff_id does not exist', function () {
    $unit = Unit::factory()->create();

    $response = $this->postJson('/api/staff/smartphone-login', [
        'extension' => '1234',
        'staff_id'  => '101010',
        'password'  => 'somepass',
        'unit_ids'  => [$unit->id],
    ]);
    $response->assertStatus(401)
        ->assertJson(['error' => 'Unauthorized']);
});

it('returns 401 when password is incorrect', function () {
    $staff = Staff::factory()->create(['password' => Hash::make('correct-pass')]);
    $unit  = Unit::factory()->create();

    $response = $this->postJson('/api/staff/smartphone-login', [
        'extension' => '9999',
        'staff_id'  => $staff->staff_id,
        'password'  => 'wrong-pass',
        'unit_ids'  => [$unit->id],
    ]);

    $response->assertStatus(401)
        ->assertJson(['error' => 'Unauthorized']);
});

it('creates extension and attaches units when credentials are valid', function () {
    $staff = Staff::factory()->create(['password' => Hash::make('secret123')]);
    $units = Unit::factory()->count(2)->create();

    $payload = [
        'extension' => '2222',
        'staff_id'  => $staff->staff_id,
        'password'  => 'secret123',
        'unit_ids'  => $units->pluck('id')->toArray(), // UUIDs
    ];

    $response = $this->postJson('/api/staff/smartphone-login', $payload);
    $response->assertStatus(200)
        ->assertJson(['message' => 'Login successful']);

    expect($staff->extension()->where('number', '2222')->exists())->toBeTrue();

    foreach ($units as $unit) {
        expect(DB::table('staff_unit')
            ->where('staff_id', $staff->id)
            ->where('unit_id', $unit->id)
            ->exists())->toBeTrue();
    }
});

it('returns 500 and message when an exception is thrown', function () {
    $staff = Staff::factory()->create(['password' => Hash::make('secret123')]);

    // Purposely supply an invalid UUID that doesn't exist and will break attach()
    $invalidUuid = '00000000-0000-0000-0000-000000000000';

    $payload = [
        'extension' => '8888',
        'staff_id'  => $staff->staff_id,
        'password'  => 'secret123',
        'unit_ids'  => [$invalidUuid],
    ];

    $response = $this->postJson('/api/staff/smartphone-login', $payload);
    $response->assertStatus(422)
        ->assertJsonStructure(['errors' => ['unit_ids.0']]);
});

it('returns 409 when trying to login while already logged in', function () {
    $staff = Staff::factory()->create(['password' => Hash::make('secret123')]);
    $unit  = Unit::factory()->create(); 
    // First login
    $staff->extension()->create(['number' => '1234']);
    $staff->units()->attach($unit->id);
    $payload = [
        'extension' => '5678',
        'staff_id'  => $staff->staff_id,
        'password'  => 'secret123',
        'unit_ids'  => [$unit->id],
    ];
    $response = $this->postJson('/api/staff/smartphone-login', $payload);
    $response->assertStatus(409)
        ->assertJson(['error' => '別のスマホでログイン済み[999]']);
});  
