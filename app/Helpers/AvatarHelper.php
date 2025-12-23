<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class AvatarHelper
{
    public static function diceBear(?string $style = null, ?string $seed = null): string
    {
        $styles = ['adventurer', 'avataaars', 'bottts', 'pixel-art', 'lorelei'];
        $style = $style ?? $styles[array_rand($styles)];
        $seed = $seed ?? Str::ulid()->toBase32();

        return "https://api.dicebear.com/7.x/{$style}/svg?seed={$seed}";
    }
}
