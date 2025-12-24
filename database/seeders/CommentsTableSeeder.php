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

    private int $commentCount = 0;

    private int $maxComments = 50;

    private CarbonInterface $currentTime;

    public function run(): void
    {
        // Postgres-specific clean start
        DB::statement('TRUNCATE TABLE comments RESTART IDENTITY CASCADE;');

        $this->users = User::all();

        // Start the clock (e.g., 2 hours ago)
        $this->currentTime = now()->subHours(2);

        while ($this->commentCount < $this->maxComments) {

            // Advance the clock for the Top Level comment
            $this->currentTime = $this->currentTime->addMinute();

            $topComment = Comment::factory()->create([
                'user_id' => $this->users->random()->id,
                'parent_id' => null,
                'created_at' => $this->currentTime,
                'updated_at' => $this->currentTime,
            ]);

            $this->commentCount++;

            // Recursively add replies
            if ($this->commentCount < $this->maxComments && fake()->boolean(70)) {
                $this->addReplies($topComment, 0);
            }
        }
    }

    private function addReplies(Comment $parentComment, int $depth): void
    {
        if ($depth >= 4 || $this->commentCount >= $this->maxComments) {
            return;
        }

        $numReplies = fake()->numberBetween(1, 3);

        for ($i = 0; $i < $numReplies && $this->commentCount < $this->maxComments; $i++) {

            // Advance the clock for EVERY reply
            $this->currentTime = $this->currentTime->addMinute();

            $reply = Comment::factory()->create([
                'user_id' => $this->users->random()->id,
                'parent_id' => $parentComment->id,
                'created_at' => $this->currentTime,
                'updated_at' => $this->currentTime,
            ]);

            $this->commentCount++;

            // 60% chance for a reply to have its own nested replies
            if (fake()->boolean(60)) {
                $this->addReplies($reply, $depth + 1);
            }
        }
    }
}
