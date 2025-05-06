<?php
// app/Http/Controllers/LikeController.php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Auth ファサードを使用

class LikeController extends Controller
{
    /**
     * 特定の投稿に「いいね」を付ける (store)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post ルートモデルバインディングで投稿を取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, Post $post)
    {
        $user = Auth::user(); // 認証済みユーザーを取得

        // すでに「いいね」しているかチェック
        if ($post->isLikedBy($user)) {
            // すでにいいね済みの場合、何もせず成功レスポンスを返す（またはエラーでも良い）
            return response()->json(['message' => 'Already liked.'], 200); // 200 OK または 409 Conflict など
        }

        // likes リレーション経由でいいねを作成 (user_id は自動設定されないので注意)
        $post->likes()->create([
            'user_id' => $user->id,
        ]);

        // 成功レスポンス (いいね後のいいね数を返すなど、オプション)
        // return response()->json(['likes_count' => $post->likes()->count()], 201); // 201 Created
        return response()->json(['message' => 'Liked successfully.'], 201); // シンプルなメッセージ
    }

    /**
     * 特定の投稿の「いいね」を解除する (destroy)
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Post  $post ルートモデルバインディングで投稿を取得
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request, Post $post)
    {
        $user = Auth::user(); // 認証済みユーザーを取得

        // ユーザーがいいねしたレコードを取得して削除
        $deleted = $post->likes()->where('user_id', $user->id)->delete();

        if ($deleted) {
            // 削除成功
             // return response()->json(['likes_count' => $post->likes()->count()], 200); // いいね数を返す場合
             return response()->noContent(); // 204 No Content が一般的
        } else {
            // いいねが見つからなかった (そもそもいいねしていなかった)
            return response()->json(['message' => 'Like not found.'], 404); // 404 Not Found
        }
    }
}