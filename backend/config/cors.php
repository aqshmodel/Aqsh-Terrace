<?php
//backend/config/cors.php
return [
    'paths' => [
        'api/*', // APIルート全体
        'login', // ログインエンドポイント
        'logout',// ログアウトエンドポイント
        'register',
        'sanctum/csrf-cookie', // CSRF Cookie取得エンドポイント
    ],

    'allowed_methods' => ['*'], // すべてのメソッドを許可 (または必要なものだけ GET, POST, PUT, DELETE など)

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000'), 'http://aqsh.boyfriend.jp','https://terrace.aqsh.co.jp'],

    // ワイルドカードを使用する場合 (セキュリティに注意)
    // 'allowed_origins' => ['*'],
    // 'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // すべてのヘッダーを許可 (より厳格に設定も可能)

    'exposed_headers' => [],

    'max_age' => 0,

    // ★重要: フロントエンドとの Cookie 送受信を許可
    'supports_credentials' => true,
];