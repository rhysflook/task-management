<?php

namespace Tests\Feature;

use App\Enums\BedStatus;
use App\Enums\PatientStatus;
use App\Models\ActiveCall;
use App\Models\Bed;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PatientControllerEndpointsTest extends TestCase
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

    public function test_can_delete_is_true_only_for_discharged_patient(): void
    {
        $discharged = $this->createPatientWithBed((string) PatientStatus::DISCHARGED->value);
        $admitted = $this->createPatientWithBed((string) PatientStatus::ADMITTED->value);

        $this->getJson('/api/patients/' . $discharged->id . '/canDelete')
            ->assertOk()
            ->assertJson(['can_delete' => true]);

        $this->getJson('/api/patients/' . $admitted->id . '/canDelete')
            ->assertOk()
            ->assertJson(['can_delete' => false]);
    }

    public function test_get_staged_returns_only_patients_without_bed_and_not_discharged(): void
    {
        $included = $this->createPatientWithoutBed((string) PatientStatus::VACANT->value);
        $this->createPatientWithBed((string) PatientStatus::VACANT->value);
        $this->createPatientWithoutBed((string) PatientStatus::DISCHARGED->value);

        $response = $this->getJson('/api/patients/getStaged');

        $response->assertOk();
        $this->assertSame([$included->id], collect($response->json('data'))->pluck('id')->all());
    }

    public function test_get_in_call_returns_only_non_discharged_patients_with_bed_and_active_call(): void
    {
        $included = $this->createPatientWithBed((string) PatientStatus::ADMITTED->value);
        ActiveCall::create([
            'uniqueid' => 'call-' . $included->id,
            'patient_id' => $included->id,
        ]);

        $withBedNoCall = $this->createPatientWithBed((string) PatientStatus::ADMITTED->value);
        $dischargedWithCall = $this->createPatientWithBed((string) PatientStatus::DISCHARGED->value);
        ActiveCall::create([
            'uniqueid' => 'call-' . $dischargedWithCall->id,
            'patient_id' => $dischargedWithCall->id,
        ]);
        $noBedWithCall = $this->createPatientWithoutBed((string) PatientStatus::VACANT->value);
        ActiveCall::create([
            'uniqueid' => 'call-' . $noBedWithCall->id,
            'patient_id' => $noBedWithCall->id,
        ]);

        $response = $this->getJson('/api/patients/getInCall');

        $response->assertOk();
        $this->assertSame([$included->id], collect($response->json('data'))->pluck('id')->all());
        $this->assertNotNull($withBedNoCall->id); // keep fixture explicit
    }

    public function test_stage_patient_releases_bed_and_sets_patient_to_vacant(): void
    {
        $patient = $this->createPatientWithBed((string) PatientStatus::ADMITTED->value);
        $bedId = $patient->bed_id;

        $this->postJson('/api/patients/' . $patient->id . '/stage')
            ->assertOk()
            ->assertJson(['message' => 'Patient staged successfully']);

        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'bed_id' => null,
            'section' => (string) PatientStatus::VACANT->value,
        ]);
        $this->assertDatabaseHas('beds', [
            'id' => $bedId,
            'status' => BedStatus::AVAILABLE->value,
        ]);
    }

    public function test_unstage_patient_returns_400_for_invalid_bed_id(): void
    {
        $patient = $this->createPatientWithoutBed((string) PatientStatus::VACANT->value);

        $this->postJson('/api/patients/' . $patient->id . '/unstage', [
            'bed_id' => '00000000-0000-0000-0000-000000000000',
        ])->assertStatus(400)
            ->assertJson(['message' => 'Invalid bed ID']);
    }

    public function test_unstage_patient_assigns_bed_and_sets_section_to_admitted(): void
    {
        $patient = $this->createPatientWithoutBed((string) PatientStatus::VACANT->value);
        [$unit, $room, $bed] = $this->createBedHierarchy();

        $this->postJson('/api/patients/' . $patient->id . '/unstage', [
            'bed_id' => $bed->id,
        ])->assertOk()
            ->assertJson(['message' => 'Patient unstaged successfully']);

        $this->assertDatabaseHas('beds', [
            'id' => $bed->id,
            'status' => BedStatus::OCCUPIED->value,
        ]);
        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'bed_id' => $bed->id,
            'room_id' => $room->id,
            'unit_id' => $unit->id,
            'section' => (string) PatientStatus::ADMITTED->value,
        ]);
    }

    public function test_set_bed_validates_required_bed_id(): void
    {
        $patient = $this->createPatientWithoutBed((string) PatientStatus::VACANT->value);

        $this->postJson('/api/patients/' . $patient->id . '/setBed', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['bed_id']);
    }

    public function test_set_bed_swaps_old_bed_to_available_and_new_bed_to_occupied(): void
    {
        [$oldUnit, $oldRoom, $oldBed] = $this->createBedHierarchy();
        $patient = $this->createPatientWithSpecificBed((string) PatientStatus::ADMITTED->value, $oldUnit, $oldRoom, $oldBed);
        [$newUnit, $newRoom, $newBed] = $this->createBedHierarchy();

        $this->postJson('/api/patients/' . $patient->id . '/setBed', [
            'bed_id' => $newBed->id,
        ])->assertOk()
            ->assertJson(['message' => 'Bed assigned successfully']);

        $this->assertDatabaseHas('beds', [
            'id' => $oldBed->id,
            'status' => BedStatus::AVAILABLE->value,
        ]);
        $this->assertDatabaseHas('beds', [
            'id' => $newBed->id,
            'status' => BedStatus::OCCUPIED->value,
        ]);
        $this->assertDatabaseHas('patients', [
            'id' => $patient->id,
            'bed_id' => $newBed->id,
            'room_id' => $newRoom->id,
            'unit_id' => $newUnit->id,
        ]);
    }

    private function createPatientWithBed(string $section): Patient
    {
        [$unit, $room, $bed] = $this->createBedHierarchy();

        return $this->createPatientWithSpecificBed($section, $unit, $room, $bed);
    }

    private function createPatientWithoutBed(string $section): Patient
    {
        [$unit, $room] = $this->createBedHierarchy(false);

        return Patient::create([
            'patient_no' => $this->patientNo(),
            'name' => '山田太郎',
            'kana' => 'ヤマダタロウ',
            'birth_day' => '1990-01-01',
            'gender' => '1',
            'unit_id' => $unit->id,
            'room_id' => $room->id,
            'bed_id' => null,
            'section' => $section,
            'admission_day' => '2026-02-01',
            'discharge_day' => $section === (string) PatientStatus::DISCHARGED->value ? '2026-02-10' : null,
        ]);
    }

    private function createPatientWithSpecificBed(string $section, Unit $unit, Room $room, Bed $bed): Patient
    {
        return Patient::create([
            'patient_no' => $this->patientNo(),
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

    private function createBedHierarchy(bool $withBed = true): array
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
        ]);

        if (!$withBed) {
            return [$unit, $room];
        }

        $bed = Bed::factory()->create([
            'room_id' => $room->id,
            'status' => BedStatus::AVAILABLE->value,
        ]);

        return [$unit, $room, $bed];
    }

    private function patientNo(): string
    {
        return (string) fake()->unique()->numberBetween(100000, 999999);
    }
}

