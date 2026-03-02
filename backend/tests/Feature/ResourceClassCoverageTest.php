<?php

namespace Tests\Feature;

use App\Enums\PatientStatus;
use App\Enums\UserType;
use App\Http\Resources\BedCollection;
use App\Http\Resources\BedResource;
use App\Http\Resources\ClientCollection;
use App\Http\Resources\ClientResource;
use App\Http\Resources\ExampleCollection;
use App\Http\Resources\ExampleResource;
use App\Http\Resources\ExtensionCollection;
use App\Http\Resources\ExtensionResource;
use App\Http\Resources\LogCollection;
use App\Http\Resources\LogResource;
use App\Http\Resources\PatientCollection;
use App\Http\Resources\PatientResource;
use App\Http\Resources\RingGroupCollection;
use App\Http\Resources\RingGroupResource;
use App\Http\Resources\RoomCollection;
use App\Http\Resources\RoomResource;
use App\Http\Resources\ServerCollection;
use App\Http\Resources\ServerResource;
use App\Http\Resources\StaffCollection;
use App\Http\Resources\StaffResource;
use App\Http\Resources\TableDataCollection;
use App\Http\Resources\UnitCollection;
use App\Http\Resources\UnitMapCollection;
use App\Http\Resources\UnitMapResource;
use App\Http\Resources\UnitResource;
use App\Models\Bed;
use App\Models\Client;
use App\Models\Example;
use App\Models\Extension;
use App\Models\Log;
use App\Models\Patient;
use App\Models\RingGroup;
use App\Models\Room;
use App\Models\Server;
use App\Models\Staff;
use App\Models\Unit;
use App\Models\UnitMap;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use Tests\TestCase;

class ResourceClassCoverageTest extends TestCase
{
    use RefreshDatabase;

    private Unit $unit;
    private Room $room;
    private Bed $bed;
    private Patient $patient;
    private Client $client;
    private Staff $staff;
    private Extension $extension;
    private RingGroup $ringGroup;
    private UnitMap $unitMap;

    protected function setUp(): void
    {
        parent::setUp();

        $this->unit = Unit::factory()->create([
            'unit_no' => '001',
            'name' => '第一病棟',
        ]);
        $this->room = Room::factory()->create([
            'unit_id' => $this->unit->id,
            'number' => '101',
            'name' => '居室一',
        ]);
        $this->bed = Bed::factory()->create([
            'room_id' => $this->room->id,
            'bed_no' => '01',
            'status' => 1,
            'position' => 1,
        ]);

        $this->patient = Patient::create([
            'patient_no' => '123456',
            'name' => '山田太郎',
            'kana' => 'ヤマダタロウ',
            'birth_day' => '1990-01-01',
            'gender' => '1',
            'unit_id' => $this->unit->id,
            'room_id' => $this->room->id,
            'bed_id' => $this->bed->id,
            'section' => (string) PatientStatus::ADMITTED->value,
            'admission_day' => '2026-02-01',
            'discharge_day' => null,
        ]);

        $this->client = Client::factory()->create([
            'bed_id' => $this->bed->id,
            'device_id' => 'device-001',
        ]);

        $this->staff = Staff::factory()->create([
            'staff_id' => 8888,
            'user_type' => UserType::CARE_STAFF->value,
        ]);
        $this->extension = Extension::create([
            'number' => '3001',
            'owner_id' => $this->staff->id,
            'owner_type' => Staff::class,
        ]);
        $this->staff->setRelation('extension', $this->extension);
        $this->unit->staff()->attach($this->staff->id);

        $this->ringGroup = RingGroup::create([
            'group_id' => 'RG-1',
            'extension_id' => $this->extension->id,
        ]);

        $this->unitMap = UnitMap::create([
            'name' => 'Map A',
            'group' => 'A',
        ]);
    }

    public function test_every_resource_class_has_a_smoke_definition(): void
    {
        $covered = array_merge(
            array_keys($this->jsonResourceDefinitions()),
            array_keys($this->collectionDefinitions())
        );
        $discovered = $this->discoverResourceClasses();

        sort($covered);
        sort($discovered);

        $this->assertSame($discovered, $covered);
    }

    public function test_json_resources_serialize_to_arrays(): void
    {
        foreach ($this->jsonResourceDefinitions() as $class => $definition) {
            [$resource, $request] = $definition();
            $serialized = $resource->toArray($request);

            $this->assertIsArray($serialized, $class . ' should serialize to array');
        }

        $groups = ExampleResource::getGroups();
        $this->assertCount(2, $groups);
    }

    public function test_collection_resources_serialize_to_arrays(): void
    {
        foreach ($this->collectionDefinitions() as $class => $definition) {
            $collection = $definition();
            $serialized = $collection->toArray(Request::create('/api/_test', 'GET'));

            $this->assertIsArray($serialized, $class . ' should serialize to array');
        }
    }

    private function jsonResourceDefinitions(): array
    {
        return [
            BedResource::class => function () {
                return [new BedResource($this->bed), Request::create('/api/beds/' . $this->bed->id, 'GET')];
            },
            ClientResource::class => function () {
                return [new ClientResource($this->client), Request::create('/api/clients/' . $this->client->id, 'GET')];
            },
            ExampleResource::class => function () {
                $example = new Example(['id' => 1, 'name' => 'Sample', 'group' => 'A']);
                return [new ExampleResource($example), Request::create('/api/examples/1', 'GET')];
            },
            ExtensionResource::class => function () {
                return [new ExtensionResource($this->extension), Request::create('/api/extensions/' . $this->extension->id, 'GET')];
            },
            LogResource::class => function () {
                $log = new Log([
                    'staff_name' => 'Staff A',
                    'extension' => '1001',
                    'patient_name' => 'Patient A',
                    'data_kbn' => '死活',
                    'time_stamp' => '2026-02-25 10:00:00',
                    'unit_name' => '第一病棟',
                    'room_name' => '居室一',
                    'bed_no' => '01',
                ]);

                return [new LogResource($log), Request::create('/api/logs/1', 'GET')];
            },
            PatientResource::class => function () {
                return [new PatientResource($this->patient), Request::create('/api/patients/' . $this->patient->id, 'GET')];
            },
            RingGroupResource::class => function () {
                return [new RingGroupResource($this->ringGroup), Request::create('/api/ringGroups/' . $this->ringGroup->id, 'GET')];
            },
            RoomResource::class => function () {
                return [new RoomResource($this->room), Request::create('/api/rooms/' . $this->room->id, 'GET')];
            },
            ServerResource::class => function () {
                $server = new Server([
                    'id' => 1,
                    'server' => 'PBX01',
                    'status' => 'OK',
                    'created_at' => now(),
                ]);

                return [new ServerResource($server), Request::create('/api/server/1', 'GET')];
            },
            StaffResource::class => function () {
                return [new StaffResource($this->staff), Request::create('/api/staff/' . $this->staff->id, 'GET')];
            },
            UnitMapResource::class => function () {
                return [new UnitMapResource($this->unitMap), Request::create('/api/unitMaps/' . $this->unitMap->id, 'GET')];
            },
            UnitResource::class => function () {
                return [new UnitResource($this->unit->fresh()->load('staff')), Request::create('/api/units/' . $this->unit->id, 'GET')];
            },
        ];
    }

    private function collectionDefinitions(): array
    {
        return [
            BedCollection::class => function () {
                return (new BedCollection(collect([$this->bed->fresh()->load('room')])))->withPagination(false);
            },
            ClientCollection::class => function () {
                return (new ClientCollection(collect([$this->client])))->withPagination(false);
            },
            ExampleCollection::class => function () {
                return (new ExampleCollection(collect([new Example(['id' => 1, 'name' => 'Sample', 'group' => 'A'])])))->withPagination(false);
            },
            ExtensionCollection::class => function () {
                return (new ExtensionCollection(collect([$this->extension])))->withPagination(false);
            },
            LogCollection::class => function () {
                return (new LogCollection(collect([new Log(['staff_name' => 'Staff A'])])))->withPagination(false);
            },
            PatientCollection::class => function () {
                return (new PatientCollection(collect([$this->patient])))->withPagination(false);
            },
            RingGroupCollection::class => function () {
                return (new RingGroupCollection(collect([$this->ringGroup])))->withPagination(false);
            },
            RoomCollection::class => function () {
                return (new RoomCollection(collect([$this->room])))->withPagination(false);
            },
            ServerCollection::class => function () {
                return (new ServerCollection(collect([new Server(['server' => 'PBX01'])])))->withPagination(false);
            },
            StaffCollection::class => function () {
                return (new StaffCollection(collect([$this->staff])))->withPagination(false);
            },
            TableDataCollection::class => function () {
                return (new TableDataCollection(collect([])))->withPagination(false);
            },
            UnitCollection::class => function () {
                return (new UnitCollection(collect([$this->unit])))->withPagination(false);
            },
            UnitMapCollection::class => function () {
                return (new UnitMapCollection(collect([$this->unitMap])))->withPagination(false);
            },
        ];
    }

    private function discoverResourceClasses(): array
    {
        $files = File::files(app_path('Http/Resources'));

        return collect($files)
            ->map(function ($file) {
                return 'App\\Http\\Resources\\' . str_replace('.php', '', $file->getFilename());
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
