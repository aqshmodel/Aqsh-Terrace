<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User; // User モデルをインポート
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; // Hash ファサードをインポート
use Illuminate\Validation\Rules; // バリデーションルール用
use Illuminate\Auth\Events\Registered; // 登録イベント (メール認証などに使用)

class RegisterController extends Controller
{
    /**
     * 新規ユーザーを登録する
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response|\Illuminate\Contracts\Routing\ResponseFactory
     */
    public function store(Request $request)
    {
        // 1. リクエストデータのバリデーション
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // 'email' ルールでメール形式をチェックし、'users' テーブル内でユニークであることを確認
            'email' => ['required', 'string', 'email', 'max:255', 'unique:'.User::class],
            // パスワードは最低8文字で、'password_confirmation' フィールドと一致することを確認
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // 2. ユーザーの作成
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            // パスワードをハッシュ化して保存
            'password' => Hash::make($request->password),
        ]);

        // 3. (オプション) 登録イベントの発行 (メール認証などを行う場合に必要)
        // event(new Registered($user));

        // 4. (オプション) 登録後に自動ログインさせる場合
        // Auth::login($user);
        // $request->session()->regenerate(); // セッションID再生成

        // 5. 登録成功レスポンス
        // 作成されたユーザー情報を返すか、成功メッセージだけを返す
        // return response()->json($user, 201); // 201 Created ステータス
        return response()->json(['message' => 'ユーザー登録が完了しました。'], 201);
    }
}