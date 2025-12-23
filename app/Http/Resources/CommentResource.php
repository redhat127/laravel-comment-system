<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            ...$this->only([
                'id',
                'body',
                'created_at',
                'updated_at',
                'user_id',
            ]),
            'created_at_for_human' => $this->created_at->diffForHumans(),
            'user' => CommentUserResource::make($this->whenLoaded('user')),
            'likes_count' => $this->whenCounted('likes'),
            'is_liked_by_auth' => $this->whenLoaded('likes', fn () => $this->likes->isNotEmpty(), false),
        ];
    }
}
