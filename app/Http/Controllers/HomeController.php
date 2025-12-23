<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class HomeController extends Controller
{
    public function index()
    {
        $comments = Comment::with([
            'user:id,name,avatar',
            'likes' => fn ($query) => $query->where('user_id', Auth::id()),
        ])
            ->withCount('likes')
            ->latest()
            ->get()
            ->toResourceCollection();

        $comments_count = Comment::count();

        return inertia('home', compact('comments', 'comments_count'));
    }
}
