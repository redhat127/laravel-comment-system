<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'parent_id' => $this->parent_id,
            'user_id' => $this->user_id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'created_at_for_human' => $this->created_at->diffForHumans(),
            'user' => CommentUserResource::make($this->whenLoaded('user')),
            'is_liked_by_auth' => $this->whenLoaded('likes', fn () => $this->likes->isNotEmpty()),
            'likes_count' => $this->whenCounted('likes', fn () => $this->likes_count),
            'replies_count' => $this->whenCounted('replies', fn () => $this->replies_count),
        ];
    }
}
