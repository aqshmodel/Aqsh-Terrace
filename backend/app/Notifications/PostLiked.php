<?php
// app/Notifications/PostLiked.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User; // ★ User モデルをインポート ★
use App\Models\Post; // ★ Post モデルをインポート ★

class PostLiked extends Notification // implements ShouldQueue
{
    use Queueable;

    // ★ 通知に必要なデータを保持するプロパティ ★
    public User $liker; // いいねしたユーザー
    public Post $post;  // いいねされた投稿

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\User $liker いいねしたユーザー
     * @param \App\Models\Post $post いいねされた投稿
     */
    public function __construct(User $liker, Post $post)
    {
        $this->liker = $liker;
        $this->post = $post;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // ★ データベースチャンネルを使用 ★
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        // ★ データベースに保存するデータ ★
        return [
            'liker_id' => $this->liker->id,
            'liker_name' => $this->liker->name,
            'post_id' => $this->post->id,
            'post_body' => \Illuminate\Support\Str::limit($this->post->body, 50), // 投稿本文も少し含める
            'message' => "{$this->liker->name}さんがあなたの投稿に「いいね！」しました。", // 通知メッセージ
        ];
    }
}