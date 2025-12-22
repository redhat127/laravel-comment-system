<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUlids, Notifiable;

    public static function generateUniqueUsername()
    {
        $username = 'user_'.Str::lower(Str::random(10));

        if (self::where('username', $username)->exists()) {
            return self::generateUniqueUsername();
        }

        return $username;
    }

    public static function generateName()
    {
        $name = 'name_'.Str::random(10);

        return $name;
    }

    protected function casts()
    {
        return ['password' => 'hashed'];
    }
}
