<?php
// app/Observers/CommentObserver.php

namespace App\Observers;

use App\Models\Comment;
use App\Models\User;
use App\Notifications\CommentReceived; // ★ 通知クラスをインポート ★

class CommentObserver
{
    /**
     * Handle the Comment "created" event.
     */
    public function created(Comment $comment): void
    {
        // ★ コメントが作成された後に実行される処理 ★

        // 投稿を取得 (コメントは投稿に属している)
        $post = $comment->post()->first(); // コメントが属する投稿を取得

        if (!$post) { return; } // 投稿が見つからない場合は何もしない

        // 投稿主を取得
        $postAuthor = $post->user()->first(); // 投稿の所有者を取得

        // コメント投稿者を取得
        $commenter = $comment->user()->first();

        // 投稿主が存在し、かつコメント投稿者と投稿主が異なる場合に通知を送る
        // (自分の投稿への自分のコメントでは通知しない)
        if ($postAuthor && $commenter && $postAuthor->id !== $commenter->id) {
            // ★ 投稿主に CommentReceived 通知を送信 ★
            $postAuthor->notify(new CommentReceived($comment));
        }
    }

    /**
     * Handle the Comment "updated" event.
     */
    public function updated(Comment $comment): void
    {
        //
    }

    /**
     * Handle the Comment "deleted" event.
     */
    public function deleted(Comment $comment): void
    {
        //
    }

    /**
     * Handle the Comment "restored" event.
     */
    public function restored(Comment $comment): void
    {
        //
    }

    /**
     * Handle the Comment "force deleted" event.
     */
    public function forceDeleted(Comment $comment): void
    {
        //
    }
}