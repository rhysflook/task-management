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

class ControllerDeepBehaviorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::factory()->create([
            'role' => 2,
            'is_active' => true,
        ]);
        $this->actingAs($user, 'sanctum');
    }

    public function test_staff_form_data_returns_next_staff_id(): void
    {
        $this->getJson('/api/staff/formData')
            ->assertOk()
            ->assertJsonStructure(['data' => ['extra_data' => ['next_staff_id']]]);
    }

    public function test_staff_edit_record_without_password_keeps_existing_hash(): void
    {
        $staff = Staff::factory()->create([
            'staff_id' => 2345,
            'name' => '旧スタッフ',
            'password' => bcrypt('1234'),
            'gender' => 1,
            'user_type' => UserType::CARE_STAFF->value,
        ]);
        $oldHash = $staff->password;

        $this->putJson('/api/staff/' . $staff->id . '/save', [
            'staff_id' => 2345,
            'name' => '新スタッフ',
            'gender' => '1',
            'user_type' => UserType::CARE_STAFF->value,
        ])->assertOk();

        $staff->refresh();
        $this->assertSame('新スタッフ', $staff->name);
        $this->assertSame($oldHash, $staff->password);
    }

    public function test_staff_smartphone_getstaffdata_returns_extensions_with_owner_details(): void
    {
        $staff = Staff::factory()->create([
            'staff_id' => 4567,
            'name' => '鈴木一郎',
            'user_type' => UserType::CARE_STAFF->value,
        ]);
        $staff->extension()->create(['number' => '7777']);

        $this->getJson('/api/client/smartphone-getstaffdata')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.0.staff_name', '鈴木一郎')
            ->assertJsonPath('data.0.number', '7777')
            ->assertJsonPath('data.0.user_type', UserType::CARE_STAFF->value);
    }

    public function test_room_edit_record_swaps_client_assignments_between_existing_beds(): void
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
            'number' => '102',
            'name' => '居室二',
        ]);
        $bed1 = Bed::factory()->create([
            'room_id' => $room->id,
            'bed_no' => '01',
            'status' => 1,
            'position' => 1,
        ]);
        $bed2 = Bed::factory()->create([
            'room_id' => $room->id,
            'bed_no' => '02',
            'status' => 1,
            'position' => 2,
        ]);
        $client1 = Client::factory()->create(['bed_id' => $bed1->id, 'device_id' => 'swap-1']);
        $client2 = Client::factory()->create(['bed_id' => $bed2->id, 'device_id' => 'swap-2']);

        $this->putJson('/api/rooms/' . $room->id . '/save', [
            'unit_id' => $unit->id,
            'number' => '102',
            'name' => '居室二',
            'beds' => [
                ['id' => $bed1->id, 'bed_no' => '01', 'client_id' => $client2->id, 'is_blank' => false],
                ['id' => $bed2->id, 'bed_no' => '02', 'client_id' => $client1->id, 'is_blank' => false],
            ],
        ])->assertOk();

        $this->assertSame($bed2->id, $client1->fresh()->bed_id);
        $this->assertSame($bed1->id, $client2->fresh()->bed_id);
    }

    public function test_room_edit_record_removes_existing_bed_and_clears_client_assignment_when_marked_blank(): void
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
            'number' => '103',
            'name' => '居室三',
        ]);
        $bed = Bed::factory()->create([
            'room_id' => $room->id,
            'bed_no' => '01',
            'status' => 1,
            'position' => 1,
        ]);
        $client = Client::factory()->create(['bed_id' => $bed->id, 'device_id' => 'blank-1']);

        $this->putJson('/api/rooms/' . $room->id . '/save', [
            'unit_id' => $unit->id,
            'number' => '103',
            'name' => '居室三',
            'beds' => [
                ['is_blank' => true],
            ],
        ])->assertOk();

        $this->assertSoftDeleted('beds', ['id' => $bed->id]);
        $this->assertNull($client->fresh()->bed_id);
    }

    public function test_room_modify_form_data_record_inserts_blank_slot_for_missing_bed_position(): void
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
            'number' => '104',
            'name' => '居室四',
        ]);
        Bed::factory()->create([
            'room_id' => $room->id,
            'bed_no' => '01',
            'status' => 1,
            'position' => 1,
        ]);
        Bed::factory()->create([
            'room_id' => $room->id,
            'bed_no' => '03',
            'status' => 1,
            'position' => 3,
        ]);

        $controller = new \App\Http\Controllers\RoomController();
        $record = new \App\Http\Resources\RoomResource($room->fresh()->load('beds.client'));
        $modified = $controller->modifyFormDataRecord($record);
        $beds = collect($modified->beds);
        $blank = $beds->firstWhere('position', 2);

        $this->assertCount(3, $beds);
        $this->assertNotNull($blank);
        $this->assertTrue((bool) ($blank['is_blank'] ?? false));
    }

    public function test_patient_edit_form_data_for_admitted_includes_admitted_outing_and_discharged_sections(): void
    {
        $patient = $this->createPatientWithSection((string) PatientStatus::ADMITTED->value);

        $response = $this->getJson('/api/patients/' . $patient->id . '/edit');

        $response->assertOk();
        $this->assertSame([
            ['id' => '2', 'name' => '入所'],
            ['id' => '3', 'name' => '外出'],
            ['id' => '4', 'name' => '退所'],
        ], $response->json('data.extra_data.section_options'));
    }

    public function test_patient_edit_form_data_for_vacant_includes_vacant_and_admitted_sections(): void
    {
        $patient = $this->createPatientWithSection((string) PatientStatus::VACANT->value);

        $response = $this->getJson('/api/patients/' . $patient->id . '/edit');

        $response->assertOk();
        $this->assertSame([
            ['id' => '1', 'name' => '空床'],
            ['id' => '2', 'name' => '入所'],
        ], $response->json('data.extra_data.section_options'));
    }

    public function test_provision_get_device_id_picks_lowest_free_aor(): void
    {
        $this->ensurePsEndpointsTable();

        DB::table('ps_endpoints')->insert([
            ['aors' => '4002'],
            ['aors' => '4001'],
        ]);
        Client::factory()->create([
            'device_id' => '4001',
        ]);

        $this->getJson('/api/deviceid')
            ->assertOk()
            ->assertJson([
                'username' => '4002',
                'password' => 'pass4002',
                'destination' => '3003',
            ]);
    }

    public function test_provision_get_device_id_returns_404_when_no_free_device_exists(): void
    {
        $this->ensurePsEndpointsTable();

        DB::table('ps_endpoints')->insert([
            ['aors' => '4001'],
        ]);
        Client::factory()->create([
            'device_id' => '4001',
        ]);

        $this->getJson('/api/deviceid')
            ->assertStatus(404)
            ->assertJson(['error' => 'No free device_id']);
    }

    public function test_unit_map_index_returns_units_sorted_by_unit_no(): void
    {
        Unit::factory()->create(['unit_no' => '002', 'name' => 'ユニットB']);
        Unit::factory()->create(['unit_no' => '001', 'name' => 'ユニットA']);

        $response = $this->getJson('/api/unitMaps');

        $response->assertOk();
        $this->assertSame('001', $response->json('data.0.unit_no'));
        $this->assertSame('002', $response->json('data.1.unit_no'));
    }

    private function createPatientWithSection(string $section): Patient
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
        ]);
        $bed = Bed::factory()->create([
            'room_id' => $room->id,
        ]);

        return Patient::create([
            'patient_no' => (string) fake()->unique()->numberBetween(100000, 999999),
            'name' => '山田太郎',
            'kana' => 'ヤマダタロウ',
            'birth_day' => '1990-01-01',
            'gender' => '1',
            'unit_id' => $unit->id,
            'room_id' => $room->id,
            'bed_id' => $bed->id,
            'section' => $section,
            'admission_day' => '2026-02-01',
            'discharge_day' => $section === (string) PatientStatus::DISCHARGED->value ? '2026-02-10' : null,
        ]);
    }

    private function ensurePsEndpointsTable(): void
    {
        if (!Schema::hasTable('ps_endpoints')) {
            Schema::create('ps_endpoints', function (Blueprint $table) {
                $table->id();
                $table->string('aors');
            });
        }

        Schema::disableForeignKeyConstraints();
        DB::table('ps_endpoints')->truncate();
        DB::table('clients')->truncate();
        Schema::enableForeignKeyConstraints();
    }
}
