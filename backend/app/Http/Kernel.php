<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array<int, class-string|string>
     */
    protected $middleware = [
        // \App\Http\Middleware\TrustHosts::class, // ★ 通常、本番環境では適切に設定
        \App\Http\Middleware\TrustProxies::class, // ★ ロードバランサやリバースプロキシの背後で動作する場合に重要
        \Illuminate\Http\Middleware\HandleCors::class, // ★ CORS (Cross-Origin Resource Sharing) の設定
        \App\Http\Middleware\PreventRequestsDuringMaintenance::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array<string, array<int, class-string|string>>
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \Illuminate\Session\Middleware\StartSession::class,
            // \Illuminate\Session\Middleware\AuthenticateSession::class, // API中心のSPAでは通常不要
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class, // ★ WebルートグループにはCSRF検証が必要
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            // ★★★ Sanctum SPA認証の核心部分 ★★★
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api', // ★ APIレート制限 (config/route-throttlers.php で設定)
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],
    ];

    /**
     * The application's middleware aliases.
     *
     * Aliases may be used to conveniently assign middleware to routes and groups.
     *
     * @var array<string, class-string|string>
     */
    protected $middlewareAliases = [ // Laravel 9/10から $routeMiddleware は $middlewareAliases になりました
        'auth' => \App\Http\Middleware\Authenticate::class, // ★ デフォルトの認証ミドルウェア
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
        // 'cors' => \Illuminate\Http\Middleware\HandleCors::class, // グローバルに適用済みなのでエイリアスは通常不要
        // 'web' => \App\Http\Middleware\EncryptCookies::class, // webグループのミドルウェアは直接グループで指定
    ];
}