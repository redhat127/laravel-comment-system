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

            // 1. Directly access user (No lazy loading because it's in with())
            'user' => CommentUserResource::make($this->user),

            // 2. Coalesce null to 0 for the frontend
            'likes_count' => (int) ($this->likes_count ?? 0),

            // 3. Directly check likes collection
            'is_liked_by_auth' => $this->likes->isNotEmpty(),

            /** * 4. Direct Recursive Call
             * Since we setRelation('descendants') in the loop, this will NOT lazy load.
             * By not using whenLoaded, the frontend will ALWAYS receive a 'replies' key.
             * If there are no replies, it returns an empty array [].
             */
            'replies' => CommentResource::collection($this->descendants),
        ];
    }
}
