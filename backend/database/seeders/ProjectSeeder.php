<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Project::withoutEvents(function() {
            Project::factory()->count(124)->sequence(function($i) { return ['code' => $i->index . "bah"];})->create();
        });
    }
}
