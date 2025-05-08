<?php
//backend/routes/channels.php
// routes/channels.php
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log; // Log ファサードを use

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    Log::info('[Channel Auth] Attempting to authorize user for channel.', [
        'auth_user_id' => $user ? $user->id : 'Guest', // 認証されていなければ $user は null
        'channel_user_id_param' => $id,
        'authenticated_user_details' => $user // 認証ユーザーの詳細をログに出力
    ]);

    // 認証済みユーザー ($user) が存在し、
    // その ID ($user->id) がチャンネル名のID ($id) と一致するかどうかを確認
    if ($user && (int) $user->id === (int) $id) {
        Log::info('[Channel Auth] Authorized.', ['user_id' => $user->id, 'channel_id' => $id]);
        // 認証成功時は、ユーザー情報を返すか、true を返す
        // Pusher/Echo が channel_data として利用できる情報を返すのが一般的
        return ['id' => $user->id, 'name' => $user->name];
        // または単に true でも動作するはず (channel_data は空になる)
        // return true;
    }

    Log::warning('[Channel Auth] Unauthorized.', [
        'auth_user_id' => $user ? $user->id : 'Guest',
        'channel_user_id_param' => $id
    ]);
    // 認証失敗時は明示的に false を返す
    return false;
});