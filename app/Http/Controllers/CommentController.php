<?php

namespace App\Http\Controllers;

use App\Models\Comment;
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

    private function validateCommentId(string $commentId)
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

        return $validator->validated()['commentId'];
    }

    public function patch(string $commentId)
    {
        $commentId = $this->validateCommentId($commentId);

        $comment = Auth::user()->comments()->findOrFail($commentId);

        if (! $comment) {
            abort(404);
        }

        $validated = request()->validate([
            'body' => $this->commentBodyRule(),
        ]);

        $comment->update($validated);

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'Comment updated.',
        ]);

        return back();
    }

    public function delete(string $commentId)
    {
        $commentId = $this->validateCommentId($commentId);

        $comment = Auth::user()->comments()->findOrFail($commentId);

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

    public function likeComment(string $commentId)
    {
        $commentId = $this->validateCommentId($commentId);

        $comment = Comment::findOrFail($commentId);

        $userId = Auth::id();

        $like = $comment->likes()->where('user_id', $userId)->first();

        $like ? $like->delete() : $comment->likes()->create(['user_id' => $userId]);

        return back();
    }
}
