<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Use oldest() so replies follow a natural conversation flow (1 -> 2 -> 3)
     */
    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->oldest();
    }

    /**
     * Alias to match your CommentResource requirement
     */
    public function descendants()
    {
        return $this->replies();
    }

    public function isParent()
    {
        return is_null($this->parent_id);
    }
}
