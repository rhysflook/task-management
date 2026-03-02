<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $deviceIds = [
            '1000', '1001', '1002', '1003', '1004',
            '1005', '1006', '1007', '1008', '1009', '1010'
        ];

        foreach ($deviceIds as $deviceId) {
            Client::factory()->create(['device_id' => $deviceId]);
        }
    }
}
