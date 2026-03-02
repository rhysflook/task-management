<?php

namespace Tests\Feature;

use App\Enums\PatientStatus;
use App\Enums\UserType;
use App\Models\Bed;
use App\Models\Client;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ClientMobileEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->ensureAsteriskTables();

        $user = User::factory()->create([
            'role' => 2,
            'is_active' => true,
        ]);
        $this->actingAs($user, 'sanctum');
    }

    public function test_register_device_id_requires_device_id_and_unique_id(): void
    {
        $this->postJson('/api/client/register-device-id', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['device_id', 'unique_id'])
            ->assertJsonMissingValidationErrors(['extension']);
    }

    public function test_register_device_id_creates_next_available_3xxx_extension_and_registers_device(): void
    {
        DB::table('ps_endpoints')->insert([
            'id' => '3019',
            'aors' => '3019',
            'auth' => '3019',
        ]);

        $response = $this->postJson('/api/client/register-device-id', [
            'device_id' => 'device-abc',
            'unique_id' => 'unique-device-abc',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => ['extension_number', 'pass', 'connection_ip'],
            ])
            ->assertJsonPath('data.extension_number', '3020')
            ->assertJsonPath('data.pass', 'pass3020');

        $this->assertDatabaseHas('ps_endpoints', [
            'id' => '3020',
        ]);
        $this->assertDatabaseHas('push_notification_devices', [
            'extension' => '3020',
            'device_id' => 'device-abc',
            'unique_id' => 'unique-device-abc',
        ]);
    }

    public function test_register_device_id_starts_from_3000_when_no_3xxx_exists(): void
    {
        $response = $this->postJson('/api/client/register-device-id', [
            'device_id' => 'device-first',
            'unique_id' => 'unique-device-first',
        ]);

        $response
            ->assertStatus(201)
            ->assertJsonPath('data.extension_number', '3000')
            ->assertJsonPath('data.pass', 'pass3000');

        $this->assertDatabaseHas('ps_endpoints', [
            'id' => '3000',
        ]);
        $this->assertDatabaseHas('push_notification_devices', [
            'extension' => '3000',
            'device_id' => 'device-first',
            'unique_id' => 'unique-device-first',
        ]);
    }

    public function test_register_device_id_rejects_duplicate_device_id(): void
    {
        DB::table('push_notification_devices')->insert([
            'extension' => '3019',
            'device_id' => 'device-1',
        ]);

        $this->postJson('/api/client/register-device-id', [
            'device_id' => 'device-1',
            'unique_id' => 'unique-device-1',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['device_id'])
            ->assertJsonMissingValidationErrors(['extension', 'unique_id']);
    }

    public function test_smartphone_getclientdata_requires_device_id(): void
    {
        $this->getJson('/api/client/smartphone-getclientdata')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['device_id']);
    }

    public function test_smartphone_getclientdata_returns_404_when_no_client_or_staff_matches(): void
    {
        $this->getJson('/api/client/smartphone-getclientdata?device_id=unknown-device')
            ->assertStatus(404)
            ->assertJson(['message' => 'Client or Staff not found']);
    }

    public function test_smartphone_getclientdata_returns_staff_payload_when_device_matches_staff_extension(): void
    {
        $staff = Staff::factory()->create([
            'user_type' => UserType::CARE_STAFF->value,
        ]);
        $staff->extension()->create([
            'number' => '3001',
        ]);

        $this->getJson('/api/client/smartphone-getclientdata?device_id=3001')
            ->assertOk()
            ->assertJson([
                'message' => 'Staff found',
                'data' => [
                    'id' => $staff->staff_id,
                    'name' => $staff->name,
                    'type' => 'Staff',
                ],
            ]);
    }

    public function test_smartphone_getclientdata_returns_client_payload_when_device_matches_client(): void
    {
        [$unit, $room, $bed] = $this->createBedHierarchy();
        $patient = Patient::create([
            'patient_no' => '123456',
            'name' => '山田太郎',
            'kana' => 'ヤマダタロウ',
            'birth_day' => '1990-01-01',
            'gender' => '1',
            'unit_id' => $unit->id,
            'room_id' => $room->id,
            'bed_id' => $bed->id,
            'section' => (string) PatientStatus::ADMITTED->value,
            'admission_day' => '2026-02-01',
            'discharge_day' => null,
        ]);

        $client = Client::factory()->create([
            'bed_id' => $bed->id,
            'device_id' => 'device-client-1',
        ]);

        $response = $this->getJson('/api/client/smartphone-getclientdata?device_id=' . $client->device_id);

        $response->assertOk()
            ->assertJson([
                'message' => 'Client found',
                'data' => [
                    'bed_number' => $bed->bed_no,
                    'room_name' => $room->name,
                    'unit_name' => $unit->name,
                    'patient_name' => $patient->name,
                    'patient_gender' => $patient->gender,
                    'type' => 'PI',
                ],
            ]);
    }

    public function test_get_all_is_alive_returns_true_for_recent_heartbeat_and_false_for_missing_heartbeat(): void
    {
        $aliveClient = Client::factory()->create([
            'device_id' => '2001',
        ]);
        $missingHeartbeatClient = Client::factory()->create([
            'device_id' => '2002',
        ]);

        DB::table('heartbeats')->insert([
            'device_id' => 2001,
            'last_heartbeat' => now()->timestamp,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/clients/check/allIsAlive');

        $response->assertOk();
        $response->assertJsonPath('2001', true);
        $response->assertJsonPath((string) $missingHeartbeatClient->id, false);
        $this->assertNotNull($aliveClient->id);
    }

    public function test_get_all_is_alive_returns_false_for_stale_heartbeat(): void
    {
        Client::factory()->create([
            'device_id' => '3001',
        ]);

        DB::table('heartbeats')->insert([
            'device_id' => 3001,
            'last_heartbeat' => now()->subMinute()->timestamp,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this->getJson('/api/clients/check/allIsAlive');

        $response->assertOk();
        $response->assertJsonPath('3001', false);
    }

    private function createBedHierarchy(): array
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
        ]);
        $bed = Bed::factory()->create([
            'room_id' => $room->id,
        ]);

        return [$unit, $room, $bed];
    }

    private function ensureAsteriskTables(): void
    {
        if (!Schema::hasTable('ps_endpoints')) {
            Schema::create('ps_endpoints', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('transport')->nullable();
                $table->string('aors')->nullable();
                $table->string('auth')->nullable();
                $table->string('context')->nullable();
                $table->string('disallow')->nullable();
                $table->string('allow')->nullable();
                $table->boolean('rtp_symmetric')->default(false);
                $table->boolean('force_rport')->default(false);
                $table->boolean('rewrite_contact')->default(false);
            });
        }

        if (!Schema::hasTable('ps_aors')) {
            Schema::create('ps_aors', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->integer('max_contacts')->nullable();
            });
        }

        if (!Schema::hasTable('ps_auths')) {
            Schema::create('ps_auths', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('auth_type')->nullable();
                $table->string('username')->nullable();
                $table->string('password')->nullable();
            });
        }
    }
}
