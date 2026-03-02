<?php

namespace Tests\Feature;

use App\Enums\UserType;
use App\Http\Requests\BedRequest;
use App\Http\Requests\ClientRequest;
use App\Http\Requests\ExampleRequest;
use App\Http\Requests\ExtensionRequest;
use App\Http\Requests\LogRequest;
use App\Http\Requests\PatientRequest;
use App\Http\Requests\ProjectRequest;
use App\Http\Requests\RegisterDeviceIdRequest;
use App\Http\Requests\RingGroupRequest;
use App\Http\Requests\RoomRequest;
use App\Http\Requests\ServerRequest;
use App\Http\Requests\SmartphoneGetClientDataRequest;
use App\Http\Requests\SmartphoneLoginRequest;
use App\Http\Requests\SmartphoneLogoutRequest;
use App\Http\Requests\StaffRequest;
use App\Http\Requests\UnitMapRequest;
use App\Http\Requests\UnitRequest;
use App\Models\Bed;
use App\Models\Patient;
use App\Models\Staff;
use App\Models\Unit;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use ReflectionClass;
use Tests\TestCase;

class FormRequestClassCoverageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // ProjectRequest has a unique(projects,code) rule but this project has no migration for projects.
        if (!Schema::hasTable('projects')) {
            Schema::create('projects', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function test_every_form_request_has_a_smoke_definition(): void
    {
        $covered = array_keys($this->requestDefinitions());
        $discovered = $this->discoverRequestClasses();

        sort($covered);
        sort($discovered);

        $this->assertSame($discovered, $covered);
    }

    public function test_form_requests_authorize_and_compile_rules_and_validate_valid_payloads(): void
    {
        foreach ($this->requestDefinitions() as $class => $definition) {
            /** @var \Illuminate\Foundation\Http\FormRequest $request */
            $request = $definition();

            $this->assertInstanceOf(FormRequest::class, $request);
            $this->assertTrue($request->authorize(), $class . ' authorize() should return true');

            $rules = $request->rules();
            $this->assertIsArray($rules, $class . ' rules() should return array');

            $messages = method_exists($request, 'messages') ? $request->messages() : [];
            $attributes = method_exists($request, 'attributes') ? $request->attributes() : [];

            $this->assertIsArray($messages, $class . ' messages() should return array');
            $this->assertIsArray($attributes, $class . ' attributes() should return array');

            $validator = Validator::make($request->all(), $rules, $messages, $attributes);
            $this->assertTrue($validator->passes(), $class . ' should pass for provided valid payload');
        }
    }

    private function requestDefinitions(): array
    {
        return [
            BedRequest::class => function () {
                return $this->makeRequest(BedRequest::class, 'POST', []);
            },
            ClientRequest::class => function () {
                return $this->makeRequest(ClientRequest::class, 'POST', []);
            },
            ExampleRequest::class => function () {
                return $this->makeRequest(ExampleRequest::class, 'POST', []);
            },
            ExtensionRequest::class => function () {
                return $this->makeRequest(ExtensionRequest::class, 'POST', []);
            },
            LogRequest::class => function () {
                return $this->makeRequest(LogRequest::class, 'POST', []);
            },
            PatientRequest::class => function () {
                $unit = Unit::factory()->create();
                $room = \App\Models\Room::factory()->create(['unit_id' => $unit->id]);
                $bed = Bed::factory()->create(['room_id' => $room->id]);
                $patient = Patient::create([
                    'patient_no' => '123456',
                    'name' => '山田太郎',
                    'kana' => 'ヤマダタロウ',
                    'birth_day' => '1990-01-01',
                    'gender' => '1',
                    'unit_id' => $unit->id,
                    'room_id' => $room->id,
                    'bed_id' => $bed->id,
                    'section' => '1',
                    'admission_day' => '2026-02-01',
                ]);

                return $this->makeRequest(PatientRequest::class, 'PUT', [
                    'patient_no' => $patient->patient_no,
                    'name' => '山田太郎',
                    'kana' => 'ヤマダタロウ',
                    'birth_day' => '1990-01-01',
                    'gender' => '1',
                    'unit_id' => $unit->id,
                    'room_id' => $room->id,
                    'bed_id' => $bed->id,
                    'section' => '1',
                    'admission_day' => '2026-02-01',
                ], ['id' => $patient->id]);
            },
            ProjectRequest::class => function () {
                return $this->makeRequest(ProjectRequest::class, 'POST', [
                    'name' => 'Project Alpha',
                    'code' => 'PA-001',
                    'description' => 'Project description',
                ]);
            },
            RegisterDeviceIdRequest::class => function () {
                return $this->makeRequest(RegisterDeviceIdRequest::class, 'POST', [
                    'device_id' => 'device-1001',
                ]);
            },
            RingGroupRequest::class => function () {
                return $this->makeRequest(RingGroupRequest::class, 'POST', []);
            },
            RoomRequest::class => function () {
                $unit = Unit::factory()->create();

                return $this->makeRequest(RoomRequest::class, 'POST', [
                    'unit_id' => $unit->id,
                    'number' => '101',
                    'name' => '居室一',
                    'beds' => [
                        ['bed_no' => '01', 'is_blank' => false],
                        ['bed_no' => '02', 'is_blank' => false],
                    ],
                ]);
            },
            ServerRequest::class => function () {
                return $this->makeRequest(ServerRequest::class, 'POST', []);
            },
            SmartphoneGetClientDataRequest::class => function () {
                return $this->makeRequest(SmartphoneGetClientDataRequest::class, 'GET', [
                    'device_id' => 'device-2001',
                ]);
            },
            SmartphoneLoginRequest::class => function () {
                $unit = Unit::factory()->create();
                $staff = Staff::factory()->create([
                    'staff_id' => 4444,
                    'user_type' => UserType::CARE_STAFF->value,
                ]);

                return $this->makeRequest(SmartphoneLoginRequest::class, 'POST', [
                    'extension' => '4001',
                    'staff_id' => $staff->staff_id,
                    'password' => 'pass1234',
                    'unit_ids' => [$unit->id],
                ]);
            },
            SmartphoneLogoutRequest::class => function () {
                $staff = Staff::factory()->create([
                    'staff_id' => 5555,
                    'user_type' => UserType::CARE_STAFF->value,
                ]);

                return $this->makeRequest(SmartphoneLogoutRequest::class, 'POST', [
                    'staff_id' => $staff->staff_id,
                ]);
            },
            StaffRequest::class => function () {
                return $this->makeRequest(StaffRequest::class, 'POST', [
                    'staff_id' => 6666,
                    'name' => '佐藤花子',
                    'password' => '1234',
                    'gender' => '1',
                ]);
            },
            UnitMapRequest::class => function () {
                return $this->makeRequest(UnitMapRequest::class, 'POST', []);
            },
            UnitRequest::class => function () {
                return $this->makeRequest(UnitRequest::class, 'POST', [
                    'unit_no' => '001',
                    'name' => '第一病棟',
                ]);
            },
        ];
    }

    private function makeRequest(string $class, string $method, array $payload, array $routeParams = []): FormRequest
    {
        /** @var \Illuminate\Foundation\Http\FormRequest $request */
        $request = $class::create('/_test', $method, $payload);
        $request->setContainer($this->app);
        $request->setRedirector($this->app->make('redirect'));
        $request->setRouteResolver(function () use ($request, $method, $routeParams) {
            $route = new Route($method, '/_test/{id}', []);
            $route->bind($request);
            foreach ($routeParams as $key => $value) {
                $route->setParameter($key, $value);
            }

            return $route;
        });

        $this->app->instance('request', $request);

        return $request;
    }

    private function discoverRequestClasses(): array
    {
        $files = File::files(app_path('Http/Requests'));

        return collect($files)
            ->map(function ($file) {
                return 'App\\Http\\Requests\\' . str_replace('.php', '', $file->getFilename());
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
