<?php

namespace App\Providers;

use App\Services\Auth0TokenVerifier;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(Auth0TokenVerifier::class, fn () => new Auth0TokenVerifier(
            config('services.auth0.domain'),
            config('services.auth0.audience'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
