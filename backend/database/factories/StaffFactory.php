<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Staff>
 */
class StaffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'staff_id' => $this->faker->unique()->numberBetween(1, 1000),
            'name' => $this->faker->name(),
            'gender' => $this->faker->numberBetween(0, 1),
            'password' => bcrypt('password'),
            'data_creator_id' => 1,
        ];
    }
}
