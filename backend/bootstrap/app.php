<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// アプリケーションインスタンスを作成し、基本的な設定を行います
return Application::configure(basePath: dirname(__DIR__))

    // ルーティング設定: 各ルートファイルのパスを指定します
    ->withRouting(
        web: __DIR__.'/../routes/web.php',      // Web 用ルートファイル
        api: __DIR__.'/../routes/api.php',      // API 用ルートファイル
        commands: __DIR__.'/../routes/console.php', // Artisan コマンド用ルートファイル
        channels: __DIR__.'/../routes/channels.php', // ブロードキャストチャンネル用ファイル
        health: '/up',                          // ヘルスチェック用エンドポイント (例: /up)
        // ここで apiPrefix: 'v1' のように API プレフィックスを変更することも可能
    )

    // ミドルウェア設定: グローバル、Web、API グループなどのミドルウェアを設定します
    ->withMiddleware(function (Middleware $middleware) {

        // API ミドルウェアグループの設定
        // prepend で配列の先頭に追加します
        $middleware->api(prepend: [
            // ★ Sanctum SPA 認証に必要なミドルウェアを追加 ★
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Web ミドルウェアグループの設定 (デフォルトで多くのミドルウェアが含まれる)
        // $middleware->web(append: [ ... ]); // 必要なら追加

        // グローバルミドルウェアの設定
        // $middleware->use([ ... ]);

        // ミドルウェアエイリアスの設定
        $middleware->alias([
            // 'auth' => \App\Http\Middleware\Authenticate::class, // 認証ミドルウェア
            // 'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class, // ゲスト用ミドルウェア
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class, // レート制限ミドルウェア
            // 他のエイリアス...
        ]);

        // 特定のミドルウェアを除外する場合
        // $middleware->remove(...);

        // ミドルウェアの優先順位を設定する場合
        // $middleware->priority(...);
    })

    // 例外処理設定: 例外ハンドリングの方法を設定します
    ->withExceptions(function (Exceptions $exceptions) {
        // ここでカスタムの例外レポートやレンダリングロジックを定義できます
        // 例: $exceptions->report(function (Throwable $e) { ... });
        // 例: $exceptions->render(function (NotFoundHttpException $e, Request $request) { ... });
    })

    // アプリケーションインスタンスを作成して返します
    ->create();