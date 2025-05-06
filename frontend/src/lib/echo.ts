// src/lib/echo.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import apiClient from './apiClient';
import { type EchoOptions } from 'laravel-echo';

// デバッグ用に Pusher のログを有効化 (開発中のみ便利)
// Pusher.logToConsole = true;

// Pusher インスタンスの connection プロパティの型を取得
// ★ options に cluster プロパティを追加 ★
const dummyPusher = new Pusher('dummy-key', {
    enabledTransports: [], // ★ 空配列に変更 ★
    cluster: 'mt1'
});
type PusherConnectionType = typeof dummyPusher.connection;
// dummyPusher.disconnect();

// ★★★ VITE_REVERB_APP_KEY の値を確認するためのログ出力 ★★★
console.log('[Echo Setup] VITE_REVERB_APP_KEY:', import.meta.env.VITE_REVERB_APP_KEY);
console.log('[Echo Setup] VITE_REVERB_HOST:', import.meta.env.VITE_REVERB_HOST);
console.log('[Echo Setup] VITE_REVERB_PORT:', import.meta.env.VITE_REVERB_PORT);
console.log('[Echo Setup] VITE_REVERB_SCHEME:', import.meta.env.VITE_REVERB_SCHEME);
// ★★★ ここまで追加 ★★★

// Reverb サーバーへの接続設定
const options: EchoOptions<'reverb'> = {
    broadcaster: 'reverb',
    // ★ key の値が undefined や空でないか確認 ★
    key: import.meta.env.VITE_REVERB_APP_KEY as string,
    wsHost: import.meta.env.VITE_REVERB_HOST as string,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080', 10),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080', 10),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],

    // チャンネル認証の設定
    authorizer: (channel: any, options: any) => {
        return {
            authorize: (socketId: string, callback: (error: Error | null, authData: any | null) => void) => {
                apiClient.post('/api/broadcasting/auth', {
                    socket_id: socketId,
                    channel_name: channel.name
                })
                .then(response => {
                    console.log(`[Echo Authorizer] Authorization successful for channel: ${channel.name}`);
                    callback(null, response.data);
                })
                .catch(error => {
                    const status = error.response?.status;
                    const errorMsg = `Authorization failed for channel ${channel.name}: Status ${status}`;
                    console.error(`[Echo Authorizer] ${errorMsg}`, error.response?.data);
                    callback(new Error(errorMsg), null);
                });
            }
        };
    },
};


// ★ options オブジェクトの内容も確認 (new Echo の直前) ★
console.log('[Echo Setup] Echo options being passed:', options);

// Echo インスタンスを作成
const echo = new Echo(options);

// echo.connector の型を確認し、pusher プロパティにアクセス
const connector = echo.connector as any;

if (connector.pusher && typeof connector.pusher.connection?.bind === 'function') {
    const connection = connector.pusher.connection as PusherConnectionType;

    connection.bind('state_change', (states: { previous: string, current: string }) => {
        console.log("[WebSocket] Connection state changed from", states.previous, "to", states.current);
    });

    connection.bind('connected', () => {
        console.log('[WebSocket] Connected successfully! Socket ID:', echo.socketId());
    });

    connection.bind('error', (err: any) => {
        console.error('[WebSocket] Connection Error:', err);
    });

    connection.bind('disconnected', () => {
        console.log('[WebSocket] Disconnected.');
    });

} else {
    console.warn("[WebSocket] Could not find 'pusher.connection.bind' on echo connector. State logging disabled.");
}

export default echo;