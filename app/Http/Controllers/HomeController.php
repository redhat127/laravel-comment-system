<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        // 1. Fetch all comments in chronological order to build tree properly
        $allComments = Comment::with([
            'user:id,name,avatar',
            'likes' => fn ($query) => $query->where('user_id', Auth::id()),
        ])
            ->withCount('likes')
            ->oldest('created_at')
            ->get();

        $commentsById = $allComments->keyBy('id');

        // 2. Initialize the 'descendants' relation for the Resource
        foreach ($allComments as $comment) {
            $comment->setRelation('descendants', collect());
        }

        // 3. Nest the comments
        foreach ($allComments as $comment) {
            if ($comment->parent_id !== null) {
                $parent = $commentsById->get($comment->parent_id);
                if ($parent) {
                    $parent->descendants->push($comment);
                }
            }
        }

        // 4. Filter for top-level threads and sort them LATEST-first
        $topLevelComments = $allComments
            ->filter(fn ($comment) => $comment->parent_id === null)
            ->sortByDesc('created_at');

        return inertia('home', [
            'comments' => CommentResource::collection($topLevelComments->values()),
            'comments_count' => Comment::count(),
        ]);
    }
}
