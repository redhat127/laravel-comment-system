<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommentResource;
use App\Models\Comment;
use App\Trait\CustomRuleValidation;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Number;

class CommentController extends Controller
{
    use CustomRuleValidation;

    public function topLevelComments()
    {
        $comments = Comment::latest('created_at')
            ->where('parent_id', null)
            ->with([
                'user:id,name,avatar',
                'likes' => fn ($query) => $query->where('user_id', Auth::id()),
            ])
            ->withCount('likes')
            ->withCount('replies')
            ->get();

        return response()->json([
            'comments' => CommentResource::collection($comments),
        ]);
    }

    public function commentsCount()
    {
        return response()->json([
            'comments_count' => Number::format(Comment::count()),
        ]);
    }

    private function validateCommentId(?string $commentId = null)
    {
        $validator = validator([
            'commentId' => $commentId ?? request()->only(['commentId'])['commentId'],
        ], [
            'commentId' => ['bail', 'required', 'string', 'ulid', 'max:50'],
        ]);

        if ($validator->fails()) {
            return ['errors' => $validator->errors()->messages()];
        }

        return $validator->validated();
    }

    public function likes()
    {
        $result = $this->validateCommentId();

        if (is_array($result) && array_key_exists('errors', $result)) {
            return response()->json(['errors' => $result['errors']], 422);
        }

        $commentId = $result['commentId'];

        $comment = Comment::find($commentId);

        if (! $comment) {
            return response()->json([], 404);
        }

        $userId = Auth::id();

        $like = $comment->likes()->where('user_id', $userId)->first();

        if ($like) {
            $like->delete();
        } else {
            $comment->likes()->create(['user_id' => $userId]);
        }

        return response()->json();
    }

    public function replyTo()
    {
        $validator = validator(request()->only(['body', 'commentId']), [
            'body' => $this->commentBodyRule(),
            'commentId' => ['bail', 'required', 'string', 'ulid', 'max:50'],
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->messages()], 422);
        }

        $validated = $validator->validated();

        $commentId = $validated['commentId'];

        $comment = Comment::find($commentId);

        if (! $comment) {
            return response()->json([], 404);
        }

        $user = Auth::user();

        if ($comment->user_id === $user->id) {
            return response()->json(['errors' => [
                'commentId' => ['You can\'t reply to your own comment.'],
            ]], 422);
        }

        return response()->json([
            'new_comment' => CommentResource::make($user->comments()->create([
                ...collect($validated)->only('body')->all(),
                'parent_id' => $commentId,
            ])),
        ]);
    }

    public function update(string $commentId)
    {
        $validator = validator([
            'commentId' => $commentId,
            'body' => request()->get('body'),
        ], [
            'commentId' => ['bail', 'required', 'string', 'ulid', 'max:50'],
            'body' => $this->commentBodyRule(),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->messages()], 422);
        }

        $validated = $validator->validated();

        $commentId = $validated['commentId'];

        $comment = Auth::user()->comments()->find($commentId);

        if (! $comment) {
            return response()->json([], 404);
        }

        $comment->body = $validated['body'];
        $comment->save();

        return response()->json([
            'updated_comment' => CommentResource::make($comment),
        ]);
    }

    public function delete(string $commentId)
    {
        $result = $this->validateCommentId($commentId);

        if (is_array($result) && array_key_exists('errors', $result)) {
            return response()->json(['errors' => $result['errors']], 422);
        }

        $commentId = $result['commentId'];

        $comment = Auth::user()->comments()->find($commentId);

        if (! $comment) {
            return response()->json([], 404);
        }

        $comment->replies()->delete();

        $comment->delete();

        return response()->noContent();
    }

    public function post()
    {
        $validator = validator([
            'body' => request()->get('body'),
        ], [
            'body' => $this->commentBodyRule(),
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()->messages()], 422);
        }

        $validated = $validator->validated();

        $user = Auth::user();

        $comment = $user->comments()->create($validated);

        $comment->setRelation('user', $user);

        return response()
            ->json([
                'new_comment' => CommentResource::make($comment),
            ]);
    }
}
