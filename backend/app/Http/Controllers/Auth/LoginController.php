<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    /**
     * ユーザーを認証し、セッションを開始する
     */
    public function store(Request $request)
    {
        // 1. リクエストデータのバリデーション
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. 認証試行
        // Auth::attempt は認証を試み、成功したら自動でセッションを開始する
        // 第2引数に true を渡すと「ログイン状態を保持」機能が有効になる ( remember トークン )
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            // 3. セッションIDの再生成 (セキュリティ対策)
            $request->session()->regenerate();

            // 4. 認証成功レスポンス (ユーザー情報を返すなど)
            // return response()->json(Auth::user());
            // または成功したことだけを返す
            return response()->noContent(); // 204 No Content が一般的
        }

        // 5. 認証失敗時のレスポンス
        // 特定のフィールドに対するエラーを返す
        throw ValidationException::withMessages([
            'email' => [__('auth.failed')], // resources/lang/ja/auth.php の 'failed' メッセージを使用
        ]);

        // または一般的なエラーメッセージ
        // return response()->json(['message' => __('auth.failed')], 401);
    }
}