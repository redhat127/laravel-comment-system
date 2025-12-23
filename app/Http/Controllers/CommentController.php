<?php

namespace App\Http\Controllers;

use App\Trait\CustomRuleValidation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

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

    public function delete(string $commentId)
    {
        $validator = validator([
            'commentId' => $commentId,
        ], [
            'commentId' => ['bail', 'required', 'string', 'max:50', 'ulid'],
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages(
                $validator->errors()->messages()
            );
        }

        $commentId = $validator->validated()['commentId'];

        $comment = Auth::user()->comments()->where('id', $commentId)->first();

        if (! $comment) {
            abort(404);
        }

        $comment->delete();

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'Comment deleted.',
        ]);

        return back();
    }
}
