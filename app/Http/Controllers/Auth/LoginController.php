<?php

namespace App\Http\Controllers\Auth;

use App\Helpers\AvatarHelper;
use App\Http\Controllers\Controller;
use App\Mail\LoginCodeMail;
use App\Models\LoginCode;
use App\Models\User;
use App\RateLimiter\CustomRateLimiter;
use App\Trait\CustomRuleValidation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    use CustomRuleValidation;

    const SESSION_KEY = 'login-code';

    private CustomRateLimiter $rateLimiterIpBased;

    private CustomRateLimiter $rateLimiterEmailBased;

    public function __construct()
    {
        $this->rateLimiterIpBased = new CustomRateLimiter(self::SESSION_KEY.':'.request()->ip(), 1);
        $this->rateLimiterEmailBased = new CustomRateLimiter('', 1);
    }

    private function tooManyAttempts()
    {
        if ($this->rateLimiterIpBased->tooManyAttempts() || $this->rateLimiterEmailBased->tooManyAttempts()) {
            $availableInSeconds = max(
                $this->rateLimiterIpBased->availableInSeconds(),
                $this->rateLimiterEmailBased->availableInSeconds(),
            );

            inertia()->flash('flashMessage', [
                'type' => 'error',
                'text' => 'You can try again in '.$availableInSeconds.' seconds.',
            ]);

            return back();
        }

        return null;
    }

    public function get()
    {
        return inertia('auth/login/index');
    }

    private function emailRememberMeValidationRules()
    {
        return [
            'email' => $this->emailRule(),
            'remember_me' => $this->rememberMeRule(),
        ];
    }

    private function sendLoginCodeAndRedirect(string $email, $redirectBack = false)
    {
        $code = (new LoginCode)->createCode($email);

        Mail::to($email)->send(new LoginCodeMail($code));

        $this->rateLimiterIpBased->hit();
        $this->rateLimiterEmailBased->hit();

        $redirect = fn () => $redirectBack ? back() :
            redirect()->route('auth.login.verifyCode.get');

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'A login code has been sent to your email.',
        ]);

        return $redirect();
    }

    public function post()
    {
        if ($response = $this->tooManyAttempts()) {
            return $response;
        }

        $validated = request()->validate($this->emailRememberMeValidationRules());

        $this->rateLimiterEmailBased->key = self::SESSION_KEY.':'.$validated['email'];

        Session::put(self::SESSION_KEY, $validated);

        return $this->sendLoginCodeAndRedirect($validated['email']);
    }

    private function forgetLoginCodeSession()
    {
        return Session::forget(self::SESSION_KEY);
    }

    private function loginCodeSessionValidated()
    {
        $validator = validator(
            Session::get(self::SESSION_KEY),
            $this->emailRememberMeValidationRules()
        );

        if ($validator->fails()) {
            $this->forgetLoginCodeSession();

            inertia()->flash('flashMessage', [
                'type' => 'error',
                'text' => 'Data is corrupted. try again.',
            ]);

            return redirect()->route('auth.login.get');
        }

        return $validator->validated();
    }

    public function verifyCode()
    {
        $loginCodeSessionValidated = $this->loginCodeSessionValidated();

        if ($loginCodeSessionValidated instanceof RedirectResponse) {
            return $loginCodeSessionValidated;
        }

        $availableIn = max(
            $this->rateLimiterIpBased->availableInSeconds(),
            $this->rateLimiterEmailBased->availableInSeconds(),
        );

        return inertia('auth/login/verify-code', [
            'email' => $loginCodeSessionValidated['email'],
            'rateLimitExpiresAt' => now()->addSeconds($availableIn)->timestamp,
        ]);
    }

    public function verifyCodePost()
    {
        $loginCodeSessionValidated = $this->loginCodeSessionValidated();

        if ($loginCodeSessionValidated instanceof RedirectResponse) {
            return $loginCodeSessionValidated;
        }

        $email = $loginCodeSessionValidated['email'];
        $remember_me = $loginCodeSessionValidated['remember_me'];

        $code = request()->validate([
            'code' => $this->codeRule(),
        ])['code'];

        $loginCode = LoginCode::where([
            'email' => $email,
        ])->first();

        if (! $loginCode) {
            $this->forgetLoginCodeSession();

            inertia()->flash('flashMessage', [
                'type' => 'error',
                'text' => 'Code not found. try again.',
            ]);

            return redirect()->route('auth.login.get');
        }

        if ($loginCode->codeExpired()) {
            $loginCode->delete();

            $this->forgetLoginCodeSession();

            inertia()->flash('flashMessage', [
                'type' => 'error',
                'text' => 'Code has expired. try again.',
            ]);

            return redirect()->route('auth.login.get');
        }

        if ($loginCode->codeTooManyAttempts()) {
            $loginCode->delete();

            $this->forgetLoginCodeSession();

            inertia()->flash('flashMessage', [
                'type' => 'error',
                'text' => 'Too many failed attempts. request a new code.',
            ]);

            return redirect()->route('auth.login.get');
        }

        if (! $loginCode->codeValid($code)) {
            $loginCode->increment('attempts');

            logger()->warning('Failed login attempt:', [
                'email' => $email,
                'ip' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            $message = ($loginCode->ip_address !== request()->ip())
                ? 'Session invalid. request a new code.'
                : 'Code is invalid. try again.';

            throw ValidationException::withMessages([
                'code' => $message,
            ]);
        }

        $userExists = User::where('email', $email)->first();

        if (! $userExists) {
            $newUser = User::create([
                'name' => User::generateName(),
                'username' => User::generateUniqueUsername(),
                'email' => $email,
                'email_verified_at' => now(),
                'avatar' => AvatarHelper::diceBear(),
            ]);
        }

        Auth::login($userExists ?? $newUser, $remember_me);
        request()->session()->regenerate();

        $loginCode->delete();

        $this->forgetLoginCodeSession();

        $this->rateLimiterIpBased->clear();
        $this->rateLimiterEmailBased->clear();

        inertia()->flash('flashMessage', [
            'type' => 'success',
            'text' => 'You are logged in.',
        ]);

        return redirect()->intended();
    }

    public function resendCode()
    {
        if ($response = $this->tooManyAttempts()) {
            return $response;
        }

        $loginCodeSessionValidated = $this->loginCodeSessionValidated();

        if ($loginCodeSessionValidated instanceof RedirectResponse) {
            return $loginCodeSessionValidated;
        }

        $email = $loginCodeSessionValidated['email'];

        return $this->sendLoginCodeAndRedirect($email, redirectBack: true);
    }
}
