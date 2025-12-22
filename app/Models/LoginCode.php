<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoginCode extends Model
{
    use HasUlids, Prunable;

    public function prunable()
    {
        return static::where('expires_at', '<=', now()->subDay());
    }

    protected function casts()
    {
        return [
            'code' => 'hashed',
            'expires_at' => 'datetime',
        ];
    }

    public function createCode(string $email)
    {
        $code = Str::random(32);

        static::updateOrCreate([
            'email' => $email,
        ], [
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
            'attempts' => 0,
            'ip_address' => request()->ip(),
        ]);

        return $code;
    }

    public function codeExpired()
    {
        return $this->expires_at->isPast();
    }

    public function codeValid(string $code)
    {
        if ($this->ip_address !== request()->ip()) {
            return false;
        }

        return Hash::check($code, $this->code);
    }

    public function codeTooManyAttempts()
    {
        return $this->attempts >= 5;
    }
}
