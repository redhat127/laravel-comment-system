<?php

namespace Database\Factories;

use App\Helpers\AvatarHelper;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => User::generateName(),
            'username' => User::generateUniqueUsername(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => 'password123456',
            'avatar' => AvatarHelper::diceBear(),
        ];
    }
}
