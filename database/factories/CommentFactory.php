<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\File;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // $markdownPath = database_path('seeders/markdown/comment-body.md');
        // $body = File::get($markdownPath);

        return [
            'body' => fake()->realText(),
            'user_id' => User::first()->id ?? User::factory(),
        ];
    }
}
