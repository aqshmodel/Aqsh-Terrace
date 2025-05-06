<?php
// app/Http/Controllers/FollowController.php

namespace App\Http\Controllers;

use App\Models\User; // User モデルをインポート
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Auth ファサード (今回は使わないが一応残す)
use App\Notifications\UserFollowed; // ★ 通知クラスをインポート ★

class FollowController extends Controller
{
    /**
     * 特定のユーザーをフォローする (store)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user ルートモデルバインディングでフォロー対象ユーザーを取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, User $user)
    {
        // ★ Auth::user() の代わりに $request->user() を使用 ★
        /** @var \App\Models\User $currentUser */ // ★ PHPDoc で型ヒントを追加 (エディタ支援用) ★
        $currentUser = $request->user();

        // 認証チェック (通常ミドルウェアで担保されるが念のため)
        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // 自分自身をフォローしようとしていないかチェック
        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'You cannot follow yourself.'], 422);
        }

        // ★ これで isFollowing メソッドが認識されるはず ★
        if ($currentUser->isFollowing($user)) {
            return response()->json(['message' => 'Already following.'], 409);
        }

        // ★ これで followings メソッドが認識されるはず ★
        $currentUser->followings()->attach($user->id);

        // ★★★ フォローされたユーザー ($user) に通知を送信 ★★★
        $user->notify(new UserFollowed($currentUser));

        return response()->json(['message' => 'Successfully followed.'], 201);
    }

    /**
     * 特定のユーザーのフォローを解除する (destroy)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\User  $user ルートモデルバインディングでフォロー解除対象ユーザーを取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, User $user)
    {
        // ★ Auth::user() の代わりに $request->user() を使用 ★
        /** @var \App\Models\User $currentUser */ // ★ PHPDoc で型ヒントを追加 ★
        $currentUser = $request->user();

        if (!$currentUser) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($currentUser->id === $user->id) {
            return response()->json(['message' => 'Invalid operation.'], 422);
        }

        // ★ これで isFollowing メソッドが認識されるはず ★
        if (!$currentUser->isFollowing($user)) {
            return response()->json(['message' => 'Not following this user.'], 404);
        }

        // ★ これで followings メソッドが認識されるはず ★
        $currentUser->followings()->detach($user->id);

        return response()->noContent(); // 204 No Content
    }
}