<?php

namespace App\Http\Controllers;

use App\Trait\CustomRuleValidation;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    use CustomRuleValidation;

    public function post()
    {
        $validated = request()->validate([
            'body' => $this->commentBodyRule(),
        ]);

        Auth::user()->comments()->create($validated);

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'Comment added.',
        ]);

        return back();
    }
}
