<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Unit>
 */
class UnitFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            //
            'name' => 'UNIT' . str_pad($this->faker->unique()->numberBetween(1, 100), 3, '0', STR_PAD_LEFT),
            'unit_no' => 'U-' . str_pad($this->faker->unique()->numberBetween(1, 100), 3, '0', STR_PAD_LEFT),
        ];
    }
};
