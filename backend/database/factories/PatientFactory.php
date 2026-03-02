<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Patient>
 */
class PatientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'patient_no' => $this->faker->unique()->numberBetween(1000, 9999),
            'name' => $this->faker->name(),
            'kana' => $this->faker->name(),
            'birth_day' => $this->faker->date(),
            'gender' => $this->faker->randomElement(['1', '2']),
            'section' => $this->faker->randomElement(['1', '2']),
            'admission_day' => $this->faker->date(),
            'discharge_day' => $this->faker->date(),
        ];
    }
}
