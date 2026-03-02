<?php

namespace Tests\Feature;

use App\Enums\PatientStatus;
use App\Http\Requests\PatientRequest;
use App\Models\Bed;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Unit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Route;
use Tests\TestCase;

class PatientRequestValidationTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
    }

    public function test_admission_day_is_required_when_section_is_admitted(): void
    {
        $patient = $this->createPatient((string) PatientStatus::VACANT->value, '123456');
        $payload = $this->validPayload($patient, (string) PatientStatus::ADMITTED->value);
        unset($payload['admission_day']);

        $validator = $this->validatePayload($patient->id, $payload);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('admission_day', $validator->errors()->toArray());
    }

    public function test_admission_day_is_not_required_when_section_is_not_admitted(): void
    {
        $patient = $this->createPatient((string) PatientStatus::VACANT->value, '123456');
        $payload = $this->validPayload($patient, (string) PatientStatus::VACANT->value);
        unset($payload['admission_day']);

        $validator = $this->validatePayload($patient->id, $payload);

        $this->assertFalse($validator->fails());
    }

    public function test_patient_no_must_be_six_digits(): void
    {
        $patient = $this->createPatient((string) PatientStatus::VACANT->value, '123456');
        $payload = $this->validPayload($patient, (string) PatientStatus::VACANT->value);
        $payload['patient_no'] = '12345';

        $validator = $this->validatePayload($patient->id, $payload);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('patient_no', $validator->errors()->toArray());
    }

    public function test_patient_no_unique_rule_ignores_current_record_on_update(): void
    {
        $patient = $this->createPatient((string) PatientStatus::VACANT->value, '123456');
        $payload = $this->validPayload($patient, (string) PatientStatus::VACANT->value);

        $validator = $this->validatePayload($patient->id, $payload);

        $this->assertFalse($validator->fails());
    }

    public function test_patient_no_unique_rule_rejects_another_active_patient_number(): void
    {
        $patient = $this->createPatient((string) PatientStatus::VACANT->value, '123456');
        $otherPatient = $this->createPatient((string) PatientStatus::VACANT->value, '654321');
        $payload = $this->validPayload($patient, (string) PatientStatus::VACANT->value);
        $payload['patient_no'] = $otherPatient->patient_no;

        $validator = $this->validatePayload($patient->id, $payload);

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('patient_no', $validator->errors()->toArray());
    }

    private function createPatient(string $section, string $patientNo): Patient
    {
        $unit = Unit::factory()->create();
        $room = Room::factory()->create([
            'unit_id' => $unit->id,
        ]);
        $bed = Bed::factory()->create([
            'room_id' => $room->id,
        ]);

        return Patient::create([
            'patient_no' => $patientNo,
            'name' => '山田太郎',
            'kana' => 'ヤマダタロウ',
            'birth_day' => '1990-01-01',
            'gender' => '1',
            'unit_id' => $unit->id,
            'room_id' => $room->id,
            'bed_id' => $bed->id,
            'section' => $section,
            'admission_day' => '2026-02-01',
            'discharge_day' => null,
        ]);
    }

    private function validPayload(Patient $patient, string $section): array
    {
        return [
            'patient_no' => '123456',
            'name' => '山田太郎',
            'kana' => 'ヤマダタロウ',
            'birth_day' => '1990-01-01',
            'gender' => '1',
            'unit_id' => $patient->unit_id,
            'room_id' => $patient->room_id,
            'bed_id' => $patient->bed_id,
            'section' => $section,
            'admission_day' => '2026-02-01',
        ];
    }

    private function validatePayload(int $patientId, array $payload): \Illuminate\Contracts\Validation\Validator
    {
        $request = PatientRequest::create('/api/patients/' . $patientId . '/save', 'PUT', $payload);
        $request->setContainer($this->app);
        $request->setRedirector($this->app->make('redirect'));
        $request->setRouteResolver(function () use ($request) {
            $route = new Route('PUT', '/api/patients/{id}/save', []);
            $route->bind($request);

            return $route;
        });

        return Validator::make($request->all(), $request->rules(), $request->messages(), $request->attributes());
    }
}
