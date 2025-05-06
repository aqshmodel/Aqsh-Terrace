<?php
// app/Http/Controllers/NotificationController.php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // ★ Auth をインポート ★
use Illuminate\Notifications\DatabaseNotification; // ★ DatabaseNotification をインポート ★

class NotificationController extends Controller
{
    /**
     * 認証ユーザーの通知一覧を取得する
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user(); // 認証ユーザーを取得

        // ユーザーの通知を新しい順にページネーションで取得
        // 既読・未読を問わず取得する (フロントエンドで未読数をカウント・表示する想定)
        $notifications = $user->notifications()->latest()->paginate($request->query('per_page', 15));

        // (オプション) 未読通知数を別途取得してレスポンスに含めることも可能
        // $unreadCount = $user->unreadNotifications()->count();
        // return response()->json(['notifications' => $notifications, 'unread_count' => $unreadCount]);

        return response()->json($notifications);
    }

    /**
     * 認証ユーザーの全ての未読通知を既読にする
     * (または、リクエストで特定の通知 ID を受け取り、それを既読にする実装も可能)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\Response
     */
    public function markAsRead(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        // ★ 全ての未読通知を取得して既読にする ★
        $user->unreadNotifications->markAsRead();

        // 成功レスポンス
        return response()->noContent(); // 204 No Content (中身は不要)

        /* --- 特定の通知IDを既読にする場合の例 ---
        $request->validate([
            'notification_id' => ['required', 'uuid', 'exists:notifications,id'],
        ]);

        $notification = $user->notifications()->find($request->input('notification_id'));

        if ($notification && !$notification->read_at) {
            $notification->markAsRead();
            return response()->noContent();
        } else {
            return response()->json(['message' => 'Notification not found or already read.'], 404);
        }
        */
    }

     /**
     * (オプション) 未読通知数を取得するエンドポイント
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
     public function unreadCount(Request $request)
     {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $count = $user->unreadNotifications()->count();
        return response()->json(['unread_count' => $count]);
     }
}