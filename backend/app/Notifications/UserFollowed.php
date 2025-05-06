<?php
// app/Notifications/UserFollowed.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User; // ★ User モデルをインポート ★

class UserFollowed extends Notification // implements ShouldQueue
{
    use Queueable;

    // ★ 通知に必要なデータを保持するプロパティ ★
    public User $follower; // フォローしたユーザー

    /**
     * Create a new notification instance.
     *
     * @param \App\Models\User $follower フォローしたユーザー
     */
    public function __construct(User $follower)
    {
        $this->follower = $follower;
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
            'follower_id' => $this->follower->id,
            'follower_name' => $this->follower->name,
            'message' => "{$this->follower->name}さんにフォローされました。", // 通知メッセージ
        ];
    }
}