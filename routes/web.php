<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LogoutController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

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

Route::middleware('auth')->group(function () {
    Route::prefix('logout')
        ->name('logout.')
        ->controller(LogoutController::class)
        ->group(function () {
            Route::post('/', 'post')->name('post');
        });

    Route::prefix('account')
        ->name('account.')
        ->controller(AccountController::class)
        ->group(function () {
            Route::get('/', 'get')->name('get');
            Route::post('/profile-details', 'profileDetails')->name('profileDetails');
        });

    Route::prefix('comment')
        ->name('comment.')
        ->controller(CommentController::class)
        ->group(function () {
            Route::post('/', 'post')->name('post');
            Route::patch('/{commentId}', 'patch')->name('patch');
            Route::delete('/{commentId}', 'delete')->name('delete');
        });
});
