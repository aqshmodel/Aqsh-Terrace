<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
{
    Broadcast::routes(['middleware' => ['web', 'auth']]);
    \Illuminate\Support\Facades\Log::info('[BroadcastServiceProvider] Broadcast::routes() called.'); // ★ ログ追加
}
}