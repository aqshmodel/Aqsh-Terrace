// src/lib/echo.ts
import Echo, { type EchoOptions } from 'laravel-echo';
import Pusher from 'pusher-js';

// 1. windowオブジェクトの型を拡張してPusherプロパティを宣言
declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

// グローバルにPusherを割り当て (Laravel Echo の要件)
window.Pusher = Pusher;

// VITE_API_URL をこのファイル内で直接使用
const API_URL_FOR_ECHO = import.meta.env.VITE_API_URL as string;

// デバッグ用に Pusher のログを有効化 (本番では false か削除)
if (import.meta.env.DEV) {
    Pusher.logToConsole = true;
}

// ★★★ Pusher/API設定値の確認ログ ★★★
if (import.meta.env.DEV) {
    // Pusher.logToConsole = true; // 重複しているので片方でOK
    console.log('[Echo Setup] VITE_PUSHER_APP_KEY:', import.meta.env.VITE_PUSHER_APP_KEY);
    console.log('[Echo Setup] VITE_PUSHER_CLUSTER:', import.meta.env.VITE_PUSHER_CLUSTER);
    console.log('[Echo Setup] VITE_PUSHER_SCHEME:', import.meta.env.VITE_PUSHER_SCHEME);
    console.log('[Echo Setup] VITE_API_URL (for authEndpoint base):', API_URL_FOR_ECHO); // 変更
}
// ★★★ ここまで追加 ★★★

// クッキーからXSRF-TOKENを取得するヘルパー関数
function getXsrfTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith('XSRF-TOKEN=')) {
            return decodeURIComponent(cookie.substring('XSRF-TOKEN='.length));
        }
    }
    if (import.meta.env.DEV) {
        // このログは頻繁に出る可能性があるので、必要に応じて制御
        // console.warn('[Echo Setup] XSRF-TOKEN cookie not found when getXsrfTokenFromCookie was called.');
    }
    return null;
}

// Echoインスタンスを先に宣言（updateEchoAuthHeadersで参照できるように）
let echo: Echo<'pusher'>; // ★ ジェネリック型引数 'pusher' を追加 ★

// Echoの認証ヘッダーを更新する関数をエクスポート
export function updateEchoAuthHeaders() {
    const token = getXsrfTokenFromCookie();
    // echo インスタンスが初期化された後でないと options にアクセスできないので、存在確認を強化
    if (echo && echo.options && echo.options.auth && typeof echo.options.auth.headers === 'object') {
        echo.options.auth.headers['X-XSRF-TOKEN'] = token || '';
        if (import.meta.env.DEV) {
            console.log('[Echo Setup] Auth headers updated. New X-XSRF-TOKEN:', token);
        }
    } else if (import.meta.env.DEV) {
        console.warn('[Echo Setup] Could not update auth headers: echo instance, options, or auth.headers not found or not an object.');
    }
}

// Laravel Echo の設定 (Pusher 用)
const echoOptions: EchoOptions<'pusher'> = {
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY as string,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER as string,
    forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
    // VITE_API_URL ("https://terrace.aqsh.co.jp/api" など) を使って完全なURLを構築
    authEndpoint: `${API_URL_FOR_ECHO}/broadcasting/auth`,
    auth: {
        headers: {
            'Accept': 'application/json',
            'X-XSRF-TOKEN': getXsrfTokenFromCookie() || '',
        },
    },
};

// ★ options オブジェクトの内容も確認 (new Echo の直前) ★
if (import.meta.env.DEV) {
    console.log('[Echo Setup] EchoOptions being passed to Echo constructor:', JSON.parse(JSON.stringify(echoOptions))); // オブジェクトをディープコピーしてログ出力
    console.log('[Echo Setup] Initial X-XSRF-TOKEN from cookie for auth header:', getXsrfTokenFromCookie());
}

// Echo インスタンスを作成・代入
echo = new Echo(echoOptions); // ここで初期化

// echo.connector.pusher にアクセスするための型ガードとアサーション
if (echo.connector && echo.options.broadcaster === 'pusher' && 'pusher' in echo.connector) {
    const pusherInstance = echo.connector.pusher as Pusher;

    if (pusherInstance.connection && typeof pusherInstance.connection.bind === 'function') {
        const connection = pusherInstance.connection;

        connection.bind('state_change', (states: { previous: string, current: string }) => {
            if (import.meta.env.DEV) { // DEV環境でのみログ出力
                console.log("[WebSocket] Connection state changed from", states.previous, "to", states.current);
            }
        });

        connection.bind('connected', () => {
            if (import.meta.env.DEV) { // DEV環境でのみログ出力
                console.log('[WebSocket] Connected successfully to Pusher! Socket ID:', echo.socketId());
            }
        });

        connection.bind('error', (err: any) => {
            let errorMessage = '[WebSocket] Pusher Connection Error:';
            if (err.error && err.error.data) {
                errorMessage += ` Type: ${err.error.type}, Code: ${err.error.data.code}, Message: ${err.error.data.message}`;
            } else if (err.message) {
                errorMessage += ` ${err.message}`;
            } else if (typeof err === 'string') {
                errorMessage += ` ${err}`;
            } else {
                try {
                    errorMessage += ` ${JSON.stringify(err)}`;
                } catch (e) {
                    errorMessage += ` (Unserializable error object)`;
                }
            }
            console.error(errorMessage, err); // エラーは常に表示
        });

        connection.bind('disconnected', () => {
            if (import.meta.env.DEV) { // DEV環境でのみログ出力
                console.log('[WebSocket] Disconnected from Pusher.');
            }
        });

        pusherInstance.bind('pusher:subscription_error', (data: {status?: number, error?: string, type?: string, info?: string} | any) => {
            let logMessage = '[WebSocket] Pusher Subscription Error (Auth Failed?): ';
            if (typeof data === 'object' && data !== null) {
                if (data.status) logMessage += `Status: ${data.status}, `;
                if (data.error) logMessage += `Error: ${data.error}, `;
                if (data.type) logMessage += `Type: ${data.type}, `;
                if (data.info) logMessage += `Info: ${data.info}, `;
            }
            console.error(logMessage, data); // エラーは常に表示
        });

    } else if (import.meta.env.DEV) {
        console.warn("[WebSocket] Could not find 'pusherInstance.connection.bind'. State logging disabled.");
    }
} else if (import.meta.env.DEV) {
    console.warn("[WebSocket] Echo connector is not a PusherConnector or 'pusher' property not found. Current broadcaster:", echo?.options?.broadcaster); // echoが未定義の可能性を考慮
}

export default echo;