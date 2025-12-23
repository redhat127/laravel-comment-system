<?php

namespace App\Http\Controllers;

use App\Trait\CustomRuleValidation;
use Illuminate\Support\Facades\Auth;

class AccountController extends Controller
{
    use CustomRuleValidation;

    public function get()
    {
        return inertia('account');
    }

    public function profileDetails()
    {
        $user = Auth::user();

        $validated = request()->validate([
            'name' => $this->nameRule(),
            'username' => $this->usernameRule(uniqueIgnoreId: $user->id),
        ]);

        $user->update([
            ...$validated,
            'username_changed_at' => now(),
        ]);

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'Your profile details have been updated.',
        ]);

        return back();
    }
}
