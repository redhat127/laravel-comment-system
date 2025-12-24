<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class CommentsTableSeeder extends Seeder
{
    private Collection $users;

    private int $commentCount = 0;

    private int $maxComments = 50;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Comment::truncate();

        $this->users = User::all();

        // Create top-level comments until we reach 50 total comments
        while ($this->commentCount < $this->maxComments) {
            // Create a top-level comment
            $topComment = Comment::factory()->create([
                'user_id' => $this->users->random()->id,
                'parent_id' => null,
            ]);
            $this->commentCount++;

            // Decide if this comment will have replies (70% chance)
            if ($this->commentCount < $this->maxComments && fake()->boolean(70)) {
                $this->addReplies($topComment, 0);
            }
        }
    }

    /**
     * Recursively add replies to a comment
     */
    private function addReplies(Comment $parentComment, int $depth): void
    {
        // Limit depth to prevent extremely deep nesting
        if ($depth >= 4 || $this->commentCount >= $this->maxComments) {
            return;
        }

        // Number of direct replies to this comment (0-5 replies)
        $numReplies = fake()->numberBetween(0, 5);

        // Decrease probability of replies as we go deeper (80%, 60%, 40%, 20%)
        $replyProbability = max(10, 80 - ($depth * 20));

        if (! fake()->boolean($replyProbability)) {
            return;
        }

        $replies = collect();

        for ($i = 0; $i < $numReplies && $this->commentCount < $this->maxComments; $i++) {
            $reply = Comment::factory()->create([
                'user_id' => $this->users->random()->id,
                'parent_id' => $parentComment->id,
            ]);
            $this->commentCount++;
            $replies->push($reply);
        }

        // Each reply has a chance to have its own replies (recursively)
        $replies->each(function (Comment $reply) use ($depth) {
            if ($this->commentCount >= $this->maxComments) {
                return false; // Stop iteration
            }

            // 60% chance a reply will have its own replies
            if (fake()->boolean(60)) {
                $this->addReplies($reply, $depth + 1);
            }
        });
    }
}
