<?php

namespace Tests\Feature;

use App\Enums\PatientStatus;
use App\Models\Bed;
use App\Models\Patient;
use App\Models\Room;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use ReflectionClass;
use Tests\TestCase;

class ControllerClassCoverageTest extends TestCase
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

    public function test_every_concrete_controller_has_a_smoke_check(): void
    {
        $covered = array_keys($this->controllerSmokeChecks());
        $discovered = $this->discoverControllerClasses();

        sort($covered);
        sort($discovered);

        $this->assertSame($discovered, $covered);
    }

    public function test_controller_smoke_checks(): void
    {
        foreach ($this->controllerSmokeChecks() as $class => $check) {
            $check();
            $this->assertTrue(class_exists($class));
        }
    }

    private function controllerSmokeChecks(): array
    {
        return [
            \App\Http\Controllers\API\TestController::class => function (): void {
                $this->getJson('/api/test')
                    ->assertOk()
                    ->assertJson(['message' => 'Hello from Laravel!']);
            },
            \App\Http\Controllers\BedController::class => function (): void {
                $this->getJson('/api/beds/formData')->assertOk();
            },
            \App\Http\Controllers\ClientController::class => function (): void {
                $this->getJson('/api/clients/formData')->assertOk();
            },
            \App\Http\Controllers\ExampleController::class => function (): void {
                $this->getJson('/api/examples/formData')->assertOk();
            },
            \App\Http\Controllers\ExtensionController::class => function (): void {
                $this->getJson('/api/extensions/formData')->assertOk();
            },
            \App\Http\Controllers\LogController::class => function (): void {
                $this->getJson('/api/logs/formData')->assertOk();
            },
            \App\Http\Controllers\PatientController::class => function (): void {
                $this->getJson('/api/patients/getStaged')->assertOk();
            },
            \App\Http\Controllers\ProvisionController::class => function (): void {
                if (!Schema::hasTable('ps_endpoints')) {
                    Schema::create('ps_endpoints', function (Blueprint $table) {
                        $table->id();
                        $table->string('aors');
                    });
                }

                Schema::disableForeignKeyConstraints();
                \DB::table('clients')->truncate();
                \DB::table('ps_endpoints')->truncate();
                Schema::enableForeignKeyConstraints();

                \DB::table('ps_endpoints')->insert([
                    'aors' => '4001',
                ]);

                $this->getJson('/api/deviceid')
                    ->assertOk()
                    ->assertJson([
                        'username' => '4001',
                        'password' => 'pass4001',
                        'destination' => '3003',
                    ]);
            },
            \App\Http\Controllers\RingGroupController::class => function (): void {
                $this->getJson('/api/ringGroups/formData')->assertOk();
            },
            \App\Http\Controllers\RoomController::class => function (): void {
                $unit = Unit::factory()->create();
                $room = Room::factory()->create(['unit_id' => $unit->id]);
                $bed = Bed::factory()->create([
                    'room_id' => $room->id,
                ]);
                Patient::create([
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
                ]);

                $this->getJson('/api/rooms/' . $room->id)->assertOk();
            },
            \App\Http\Controllers\ServerController::class => function (): void {
                $this->getJson('/api/server/formData')->assertOk();
            },
            \App\Http\Controllers\StaffController::class => function (): void {
                $this->getJson('/api/staff/formData')->assertOk();
            },
            \App\Http\Controllers\UnitController::class => function (): void {
                $unitB = Unit::factory()->create(['unit_no' => '002', 'name' => 'ユニットB']);
                $unitA = Unit::factory()->create(['unit_no' => '001', 'name' => 'ユニットA']);

                $response = $this->getJson('/api/units')->assertOk();
                $data = $response->json();

                $this->assertSame('ユニットA', $data[$unitA->id] ?? null);
                $this->assertSame('ユニットB', $data[$unitB->id] ?? null);
            },
            \App\Http\Controllers\UnitMapController::class => function (): void {
                $this->getJson('/api/unitMaps')->assertOk()->assertJsonStructure(['data']);
            },
        ];
    }

    private function discoverControllerClasses(): array
    {
        $files = File::allFiles(app_path('Http/Controllers'));

        return collect($files)
            ->map(function ($file) {
                return 'App\\Http\\Controllers\\' . str_replace(
                    ['/', '.php'],
                    ['\\', ''],
                    $file->getRelativePathname()
                );
            })
            ->filter(function ($class) {
                if (!class_exists($class)) {
                    return false;
                }
                return !(new ReflectionClass($class))->isAbstract();
            })
            ->values()
            ->all();
    }
}
