<?php
// app/Notifications/CommentReceived.php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
// ★ ShouldBroadcast をインポート ★
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage; // ★ BroadcastMessage をインポート ★
use Illuminate\Notifications\Notification;
use App\Models\Comment;
use App\Models\User;

// ★ ShouldBroadcast を実装 ★
class CommentReceived extends Notification implements ShouldBroadcast // implements ShouldQueue // ShouldQueue は必要なら後で追加
{
    use Queueable;

    public Comment $comment;
    public User $commenter;

    /**
     * Create a new notification instance.
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
        // ★ コメント作成時に Eager load されていることを期待するか、ここでロード ★
        $this->commenter = $comment->user ?? $comment->user()->firstOrFail();
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // ★ 'database' と 'broadcast' を返す ★
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification (for database channel).
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        // データベース保存用 (変更なし)
        return [
            'comment_id' => $this->comment->id,
            'comment_body' => \Illuminate\Support\Str::limit($this->comment->body, 50),
            'commenter_id' => $this->commenter->id,
            'commenter_name' => $this->commenter->name,
            'post_id' => $this->comment->post_id,
            'message' => "{$this->commenter->name}さんがあなたの投稿にコメントしました。",
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     * ★ 追加 ★
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\BroadcastMessage
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        // ブロードキャストで送信するデータ
        return new BroadcastMessage([
            // toArray と同様の基本データ
            'comment_id' => $this->comment->id,
            'comment_body' => \Illuminate\Support\Str::limit($this->comment->body, 50),
            'commenter_id' => $this->commenter->id,
            'commenter_name' => $this->commenter->name,
            'post_id' => $this->comment->post_id,
            'message' => "{$this->commenter->name}さんがあなたの投稿にコメントしました。",
            // フロントエンドでの処理に役立つ追加情報 (任意)
            'notification_id' => $this->id, // Laravel Notification の UUID
            'read_at' => null,
            'created_at' => now()->toIso8601String(), // WebSocket 受信時のタイムスタンプとして
            'post_owner_id' => $this->comment->post->user_id, // 念のため投稿主 ID も
        ]);
    }

    /**
     * Get the type of the notification being broadcast.
     * ★ 追加 ★
     * @return string
     */
    public function broadcastType(): string
    {
        // フロントエンドでリッスンするイベント名
        return 'CommentReceived';
    }
}