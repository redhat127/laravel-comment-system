<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CommentsTableSeeder extends Seeder
{
    private Collection $users;

    private CarbonInterface $currentTime;

    public function run(): void
    {
        // Postgres-specific clean start
        DB::statement('TRUNCATE TABLE comments RESTART IDENTITY CASCADE;');

        $this->users = User::all();

        // Start way back in the past (30 days ago)
        $this->currentTime = now()->subDays(30);

        // Create exactly 50 top-level comments
        for ($i = 0; $i < 50; $i++) {
            $topComment = Comment::factory()->create([
                'user_id' => $this->users->random()->id,
                'parent_id' => null,
                'created_at' => $this->currentTime,
                'updated_at' => $this->currentTime,
            ]);

            // Advance time slightly after creating top-level comment
            $this->currentTime = $this->currentTime->addMinutes(fake()->numberBetween(5, 30));

            // Add 1-3 replies to each top-level comment
            $this->addReplies($topComment, 1);

            // Add some gap between top-level comment threads
            $this->currentTime = $this->currentTime->addMinutes(fake()->numberBetween(10, 60));
        }
    }

    private function addReplies(Comment $parentComment, int $depth): void
    {
        // Stop at depth 3
        if ($depth > 3) {
            return;
        }

        // Each comment gets 1-3 replies
        $numReplies = fake()->numberBetween(1, 3);

        for ($i = 0; $i < $numReplies; $i++) {
            // Replies come after their parent
            $this->currentTime = $this->currentTime->addMinutes(fake()->numberBetween(2, 15));

            $reply = Comment::factory()->create([
                'user_id' => $this->users->random()->id,
                'parent_id' => $parentComment->id,
                'created_at' => $this->currentTime,
                'updated_at' => $this->currentTime,
            ]);

            // Recursively add replies if we haven't reached max depth
            if ($depth < 3) {
                $this->addReplies($reply, $depth + 1);
            }
        }
    }
}
