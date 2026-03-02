<?php

namespace Tests\Feature;

use App\Enums\BedStatus;
use App\Enums\PatientStatus;
use App\Enums\UserType;
use App\Models\Bed;
use App\Models\Client;
use App\Models\Extension;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManagementControllersBehaviorTest extends TestCase
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

    public function test_unit_can_delete_false_when_staff_attached(): void
    {
        $unit = Unit::factory()->create();
        $staff = Staff::factory()->create(['user_type' => UserType::CARE_STAFF->value]);
        $unit->staff()->attach($staff->id);

        $this->getJson('/api/units/' . $unit->id . '/canDelete')
            ->assertOk()
            ->assertJson(['can_delete' => false]);
    }

    public function test_unit_can_delete_true_when_no_staff_attached(): void
    {
        $unit = Unit::factory()->create();

        $this->getJson('/api/units/' . $unit->id . '/canDelete')
            ->assertOk()
            ->assertJson(['can_delete' => true]);
    }

    public function test_unit_delete_detaches_staff_and_soft_deletes_record(): void
    {
        $unit = Unit::factory()->create();
        $staff = Staff::factory()->create(['user_type' => UserType::CARE_STAFF->value]);
        $unit->staff()->attach($staff->id);

        $this->deleteJson('/api/units/' . $unit->id)
            ->assertOk();

        $this->assertSoftDeleted('units', ['id' => $unit->id]);
        $this->assertDatabaseMissing('staff_unit', [
            'staff_id' => $staff->id,
            'unit_id' => $unit->id,
        ]);
    }

    public function test_staff_can_delete_false_when_units_attached(): void
    {
        $staff = Staff::factory()->create(['user_type' => UserType::CARE_STAFF->value]);
        $unit = Unit::factory()->create();
        $staff->units()->attach($unit->id);

        $this->getJson('/api/staff/' . $staff->id . '/canDelete')
            ->assertOk()
            ->assertJson(['can_delete' => false]);
    }

    public function test_staff_can_delete_true_when_no_units_attached(): void
    {
        $staff = Staff::factory()->create(['user_type' => UserType::CARE_STAFF->value]);

        $this->getJson('/api/staff/' . $staff->id . '/canDelete')
            ->assertOk()
            ->assertJson(['can_delete' => true]);
    }

    public function test_staff_delete_detaches_units_and_soft_deletes_record(): void
    {
        $staff = Staff::factory()->create(['user_type' => UserType::CARE_STAFF->value]);
        $unit = Unit::factory()->create();
        $staff->units()->attach($unit->id);

        $this->deleteJson('/api/staff/' . $staff->id)
            ->assertOk();

        $this->assertSoftDeleted('staff', ['id' => $staff->id]);
        $this->assertDatabaseMissing('staff_unit', [
            'staff_id' => $staff->id,
            'unit_id' => $unit->id,
        ]);
    }

    public function test_room_can_delete_shows_not_deletable_when_occupied_or_outing_bed_exists(): void
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create(['unit_id' => $unit->id]);
        Bed::factory()->create([
            'room_id' => $room->id,
            'status' => BedStatus::OCCUPIED->value,
        ]);

        $this->getJson('/api/rooms/' . $room->id . '/canDelete')
            ->assertOk()
            ->assertJson(['message' => 'この部屋は削除できません。']);
    }

    public function test_room_can_delete_shows_deletable_when_no_occupied_or_outing_beds(): void
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create(['unit_id' => $unit->id]);
        Bed::factory()->create([
            'room_id' => $room->id,
            'status' => BedStatus::AVAILABLE->value,
        ]);

        $this->getJson('/api/rooms/' . $room->id . '/canDelete')
            ->assertOk()
            ->assertJson(['message' => 'この部屋は削除可能です。']);
    }

    public function test_room_delete_clears_client_and_patient_bed_links_and_soft_deletes_room_and_beds(): void
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create(['unit_id' => $unit->id]);
        $bed = Bed::factory()->create([
            'room_id' => $room->id,
            'status' => BedStatus::AVAILABLE->value,
        ]);

        $extension = Extension::create([
            'number' => '3001',
            'owner_id' => null,
            'owner_type' => null,
        ]);

        $client = Client::factory()->create([
            'bed_id' => $bed->id,
            'extension_id' => $extension->id,
            'device_id' => 'device-x',
        ]);

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

        $this->deleteJson('/api/rooms/' . $room->id)
            ->assertOk();

        $this->assertSoftDeleted('rooms', ['id' => $room->id]);
        $this->assertSoftDeleted('beds', ['id' => $bed->id]);
        $this->assertDatabaseHas('clients', [
            'id' => $client->id,
            'bed_id' => null,
            'extension_id' => null,
        ]);
        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'bed_id' => null,
        ]);
    }
}

