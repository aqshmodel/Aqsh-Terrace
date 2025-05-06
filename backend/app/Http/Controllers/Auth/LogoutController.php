<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    /**
     * ユーザーをログアウトさせ、セッションを無効にする
     */
    public function destroy(Request $request)
    {
        // 現在のガード (通常は 'web') からユーザーをログアウト
        Auth::guard('web')->logout();

        // セッションを無効化
        $request->session()->invalidate();

        // セッショントークンを再生成 (任意だが推奨)
        $request->session()->regenerateToken();

        // ログアウト成功レスポンス
        return response()->noContent(); // 204 No Content
    }
}