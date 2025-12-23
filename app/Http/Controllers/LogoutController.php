<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function post()
    {
        Auth::logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'You are logged out.',
        ]);

        return redirect()->route('home');
    }
}
