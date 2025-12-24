<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'dave',
            'email' => 'dave@example.com',
        ]);

        User::factory()->create([
            'name' => 'alice',
            'email' => 'alice@example.com',
        ]);

        User::factory()->create([
            'name' => 'bob',
            'email' => 'bob@example.com',
        ]);
    }
}
