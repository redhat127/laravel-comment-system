<?php

namespace App\Http\Controllers;

use App\Models\Comment;

class HomeController extends Controller
{
    public function index()
    {
        $comments = Comment::with('user:id,name,avatar')
            ->latest()
            ->get()
            ->toResourceCollection();

        $comments_count = Comment::count();

        return inertia('home', compact('comments', 'comments_count'));
    }
}
