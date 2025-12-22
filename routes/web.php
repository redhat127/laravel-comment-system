<?php

use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('home');
})->name('home');

Route::middleware('guest')->group(function () {
    Route::prefix('auth')
        ->name('auth.')
        ->group(function () {
            Route::prefix('login')
                ->name('login.')
                ->controller(LoginController::class)
                ->group(function () {
                    Route::get('/', 'get')->name('get');
                    Route::post('/', 'post')->name('post');
                    Route::get('/verify-code', 'verifyCode')->name('verifyCode.get');
                    Route::post('/verify-code', 'verifyCodePost')->name('verifyCode.post');
                    Route::post('/resend-code', 'resendCode')->name('resendCode');
                });
        });
});
