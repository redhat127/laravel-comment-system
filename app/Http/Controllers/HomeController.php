<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        // First, get all comments (top-level and nested) with their relationships
        $allComments = Comment::with([
            'user:id,name,avatar',
            'likes' => fn ($query) => $query->where('user_id', Auth::id()),
        ])
            ->withCount('likes')
            ->latest()
            ->get();

        // Build the nested structure
        $commentsById = $allComments->keyBy('id');

        // Initialize descendants (not replies) as empty collection for all comments
        foreach ($allComments as $comment) {
            $comment->setRelation('descendants', collect());
        }

        // Build the nested structure
        foreach ($allComments as $comment) {
            if ($comment->parent_id !== null) {
                // Attach this comment as a reply to its parent
                $parent = $commentsById->get($comment->parent_id);
                if ($parent) {
                    $parent->descendants->push($comment);
                }
            }
        }

        // Get only top-level comments
        $topLevelComments = $allComments->filter(fn ($comment) => $comment->parent_id === null);

        $comments = $topLevelComments->values()->toResourceCollection();
        $comments_count = Comment::count();

        return inertia('home', compact('comments', 'comments_count'));
    }
}
