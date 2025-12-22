<?php

namespace App\RateLimiter;

use Illuminate\Support\Facades\RateLimiter;

class CustomRateLimiter
{
    public string $key;

    private int $maxAttempts;

    public function __construct(string $key, int $maxAttempts)
    {
        $this->key = $key;
        $this->maxAttempts = $maxAttempts;
    }

    public function tooManyAttempts()
    {
        return RateLimiter::tooManyAttempts($this->key, $this->maxAttempts);
    }

    public function availableInSeconds()
    {
        return RateLimiter::availableIn($this->key);
    }

    public function hit(int $decaySeconds = 60)
    {
        return RateLimiter::hit($this->key, $decaySeconds);
    }

    public function clear()
    {
        return RateLimiter::clear($this->key);
    }
}
