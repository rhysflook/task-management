<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\Staff;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Symfony\Component\Console\Helper\ProgressBar;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Unit;
use App\Models\Bed;
use App\Models\Client;
use App\Models\Extension;
use App\Models\Patient;
use App\Models\RingGroup;
use Faker\Factory as Faker;
use Database\Seeders\Helper\CustomSql;

use Illuminate\Support\Facades\Log;

use Closure;
use Illuminate\Database\Eloquent\Collection;
class CustomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();
        // Admin
        try {
            DB::beginTransaction();
            User::truncate();
            $this->command->warn(PHP_EOL . 'Creating admin user...');
            $user = User::factory(1)->create([
                'email' => 'admin@mail.com',
                'role' => 2,
            ]);
            $this->command->info('Admin user created.');
    
            // UNIT
            $this->command->warn(PHP_EOL . 'Creating unit...');
            $units = Unit::factory(5)->has(
                Staff::factory()->count(10)->has(
                    Extension::factory()->count(1)
                )
            )->create();
            $firstThreeStaff = Staff::take(3)->get();
            $customNumbers = [1001, 1002, 1003];

            foreach ($firstThreeStaff as $i => $staff) {
                $extension = $staff->extension; // Assuming morphOne relationship
                if ($extension) {
                    $extension->number = $customNumbers[$i];
                    $extension->save();
                }
            }
            $this->command->info('Unit created.');

            // Rooms
            $this->command->warn(PHP_EOL . 'Creating rooms...');
            $rooms = $units->flatMap(function ($unit) {
                return Room::factory()
                    ->count(5)
                    ->create(['unit_id' => $unit->id]);
            });
            $this->command->info('Rooms created.');

            // Beds
            $this->command->warn(PHP_EOL . 'Creating beds...');
            $beds = $rooms->flatMap(function ($room) {
                return Bed::factory(4)
                    ->has(Client::factory())
                    ->create(['room_id' => $room->id]);
            });
            $this->command->info('Beds created.');

            // Patients
            $this->command->warn(PHP_EOL . 'Creating patients...');
            $beds->flatMap(function ($bed) {
                return Patient::factory()
                    ->count(1)
                    ->create(['bed_id' => $bed->id, 'room_id' => $bed->room_id, 'unit_id' => $bed->room->unit_id]);
            });
            $this->command->info('Patients created.');

            // Extensions
            $this->command->warn(PHP_EOL . 'Creating extensions for clients...');
            $number = 1000;
            $clients = Client::all();
            $clients->each(function ($client, $index) use (&$number) {
                $client->extension()->create([
                    'number' => $number,
                    'owner_id' => $client->id,
                    'owner_type' => Client::class,
                ]);
                if ($index === 0) {
                    $number += 4; // After first client, jump to 1004
                } else {
                    $number++;    // Then increment by 1 for each subsequent client
                }
            });
            $this->command->info('Extensions created.');

            // Call Logs
            $this->command->warn(PHP_EOL . 'Creating call_logs...');
            $callers = Extension::where('owner_type', Client::class)->get();
            $receivers = Extension::where('owner_type', Staff::class)->get();
            foreach (range(1, 10) as $i) {
                $callerid = $faker->randomElement($callers)->number;
                $connected_exten = $faker->randomElement($receivers)->number;
                $call_started = now()->subMinutes($faker->numberBetween(1, 120));
                $call_connected = $call_started->copy()->addMinutes($faker->numberBetween(0, 10));
                $call_ended = $call_connected->copy()->addMinutes($faker->numberBetween(1, 10));
                CustomSql::insertCallHistory([
                    'callerid' => $callerid,
                    'connected_exten' => $connected_exten,
                    'channel' => 'PJSIP/' . $callerid.'-'.$faker->numberBetween(10000000,99999999),
                    'exten' => $connected_exten,
                    'uniqueid' => uniqid(),
                    'bridge_uuid' => $faker->uuid,
                    'call_started' => $call_started,
                    'call_connected' => $call_connected,
                    'call_ended' => $call_ended,
                    'connected_endpoint' => 'PJSIP/' . $connected_exten,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            $this->command->info('Call logs created.');

            $this->command->warn(PHP_EOL . 'Creating SIP_REG_LOG...');
            $connected_exten = "";
            foreach (range(1, 10) as $i) {
                $callerid = Extension::inRandomOrder()->first()->number;
                $exten = $faker->randomElement($receivers)->number;
                $statusOptions = ['Reachable', 'Unreachable'];
                $status = $faker->randomElement($statusOptions);
                $contactStatus = ($status === 'Reachable') ? 'NonQualified' : (($status === 'Unreachable') ? 'Removed' : 'Unknown');
                CustomSql::insertSipRegHistory([
                    'callerid' => $callerid,
                    'connected_exten' => $connected_exten,
                    'aor' => $exten,
                    'endpoint' => 'PJSIP/' . $exten,
                    'peer' => 'peer_' . $exten,
                    'uri' => $faker->ipv4,
                    'privilege' => 'system,all',
                    'contact_status' => $contactStatus,
                    'peer_status' => $status
                ]);
            }
            $this->command->info('SIP_REG_LOG created.');

            $this->command->warn(PHP_EOL . 'Creating MQTT_LOG...');
            foreach (range(1, 10) as $i) {

                $device_id = $faker->randomElement($callers)->number;
                CustomSql::insertMqttLog([
                    'callerid' => $device_id,
                    'connected_exten' => '',
                    'topic' => 'nursecall/device/',
                    'device_id' => $device_id,
                    'payload' => json_encode(['device_id' => $device_id, 'message' => $faker->sentence])
                ]);
            }
            $this->command->warn(PHP_EOL . 'MQTT_LOG created.');

            $this->command->warn(PHP_EOL . 'Creating Ring Groups...');
            $array = Extension::whereIn('number', ['1001', '1002', '1003'])->pluck('id');
            foreach ($array as $extensionId){
                RingGroup::create([
                    'group_id' => '2100',
                    'extension_id' => $extensionId
                ]);
            }
            $this->command->info('Ring Groups created.');


        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error occurred while seeding: ' . $e->getMessage());
            return;
        } finally {
            DB::commit();
        }

    }
}
