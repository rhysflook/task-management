<?php

namespace Database\Seeders;

use App\Models\Bed;
use App\Models\Room;
use App\Models\Staff;
use App\Models\Unit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Unit::factory()
            ->count(10)
            ->has(Staff::factory()->count(4))
            ->has(Room::factory()->has(Bed::factory()->count(4))->count(4))
            ->create();
    }
}
