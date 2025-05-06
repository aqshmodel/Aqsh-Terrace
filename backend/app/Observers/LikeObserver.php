<?php
// app/Observers/LikeObserver.php

namespace App\Observers;

use App\Models\Like;
use App\Models\User;
use App\Notifications\PostLiked; // ★ 通知クラスをインポート ★

class LikeObserver
{
    /**
     * Handle the Like "created" event.
     */
    public function created(Like $like): void
    {
        // ★ いいねが作成された後に実行される処理 ★

        // いいねされた投稿を取得
        $post = $like->post()->first();
        if (!$post) { return; }

        // 投稿主を取得
        $postAuthor = $post->user()->first();

        // いいねしたユーザーを取得
        $liker = $like->user()->first();

        // 投稿主が存在し、かついいねしたユーザーと投稿主が異なる場合に通知を送る
        // (自分の投稿への自分のいいねでは通知しない)
        if ($postAuthor && $liker && $postAuthor->id !== $liker->id) {
            // ★ 投稿主に PostLiked 通知を送信 ★
            $postAuthor->notify(new PostLiked($liker, $post));
        }
    }

    // ... (他のメソッド updated, deleted など) ...
}