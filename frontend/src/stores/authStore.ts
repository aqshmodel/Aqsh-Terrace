// frontend/src/stores/authStore.ts
import { create } from 'zustand';
import apiClient, { fetchCsrfToken } from '../lib/apiClient'; // apiClientとfetchCsrfTokenをインポート
import echo, { updateEchoAuthHeaders } from '../lib/echo';   // echoとupdateEchoAuthHeadersをインポート

// VITE_API_URL を直接使用
const API_URL = import.meta.env.VITE_API_URL as string;

export type UserData = {
  id: number;
  name: string;
  email?: string;
  profile_image_url?: string | null;
};

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  isLoading: boolean;
  login: (userData: UserData, _fromCheckAuth?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  checkAuthStatus: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true,
  login: async (userData, _fromCheckAuth = false) => {
    if (import.meta.env.DEV) {
        console.log('[AuthStore] login called. UserData:', userData);
    }
    try {
        await fetchCsrfToken();
        updateEchoAuthHeaders();
        set({ isLoggedIn: true, user: userData, isLoading: false });
        if (echo && echo.connector && !echo.connector.pusher?.connection.socket_id) {
            if (import.meta.env.DEV) console.log('[AuthStore] Echo seems disconnected, attempting to connect.');
            echo.connect();
        } else if (import.meta.env.DEV && echo && echo.connector && echo.connector.pusher?.connection.socket_id) {
            console.log('[AuthStore] Echo already connected. Socket ID:', echo.socketId());
        }
    } catch (error) {
        console.error('[AuthStore] Error during login post-processing (CSRF/Echo update):', error);
        set({ isLoggedIn: true, user: userData, isLoading: false });
    }
  },
  logout: async () => {
    if (import.meta.env.DEV) console.log('[AuthStore] logout action initiated.');
    const state = get(); // isLoading をチェックするために state を取得
    if (state.isLoading) { // ★ 既に処理中なら何もしない（二重実行防止）
        if (import.meta.env.DEV) console.log('[AuthStore] Logout already in progress, skipping.');
        return;
    }
    set({ isLoading: true }); // ★ ローディング開始
    try {
      // ログアウトAPI呼び出し
      await apiClient.post(
        `${API_URL}/logout`,
        {},
        { headers: { 'Content-Type': 'application/json' } } // Content-Type指定 (apiClientデフォルト設定なら不要かも)
      );

      if (echo) {
        echo.disconnect();
        if (import.meta.env.DEV) console.log('[AuthStore] Echo disconnected on logout.');
      }
      // ログアウト成功後はフロントエンドの状態を更新
      set({ isLoggedIn: false, user: null, isLoading: false });
      // ★ CSRFトークン取得やヘッダー更新はログアウト成功後には不要かもしれない
      // ★ （次のログイン時に取得するため）
      // await fetchCsrfToken();
      // updateEchoAuthHeaders();
      if (import.meta.env.DEV) console.log('[AuthStore] Logout successful, state updated.');

    } catch (error: any) {
      console.error('[AuthStore] Logout API call failed:', error);
      if (error.config && error.config.headers) {
        console.error('[AuthStore] Headers sent with failed logout request:', error.config.headers);
      }
      if (error.response && error.response.data) {
        console.error('[AuthStore] Error response data from logout API:', error.response.data);
      }
      // API呼び出しが失敗しても、フロントエンド側ではログアウト状態にする
      if (echo) echo.disconnect();
      set({ isLoggedIn: false, user: null, isLoading: false }); // ★ isLoadingをfalseに戻す
      if (import.meta.env.DEV) console.log('[AuthStore] Logout processed on frontend despite API error.');
      // ★ エラーを再スローしない（UI側でハンドリングしないなら）
    }
  },
  setLoading: (loading) => set({ isLoading: loading }),
  checkAuthStatus: async () => {
    if (get().isLoggedIn && get().user) {
        if (import.meta.env.DEV) console.log('[AuthStore] checkAuthStatus: Already logged in with user:', get().user);
        set({ isLoading: false });
        try {
            await fetchCsrfToken();
            updateEchoAuthHeaders();
        } catch (csrfError) {
            console.error("[AuthStore] Failed to refresh CSRF token for already logged in user:", csrfError);
        }
        return;
    }
    if (import.meta.env.DEV) console.log('[AuthStore] checkAuthStatus: Checking user authentication status...');
    set({ isLoading: true });
    try {
      // fetchCsrfToken は apiClient.ts 内で appUrl を使うので、ここでは事前呼び出し不要な場合もあるが、念のため。
      // ただし、この fetchCsrfToken は login メソッド内でも呼ばれるので、重複を避けるか、冪等性を担保する。
      // ここでは、まずCSRFを取得し、次にユーザー情報を取得する流れを明確にする。
      await fetchCsrfToken();
      updateEchoAuthHeaders(); // apiClient を使う前にヘッダーを更新

      // 完全なURLを指定
      const response = await apiClient.get<UserData>(`${API_URL}/user`);

      if (import.meta.env.DEV) console.log('[AuthStore] checkAuthStatus: User data fetched:', response.data);
      await get().login(response.data, true);
    } catch (error: any) {
      if (import.meta.env.DEV) {
          if (error.response && (error.response.status === 401 || error.response.status === 419)) {
              console.log('[AuthStore] checkAuthStatus: User not authenticated (401/419). URL:', error.config?.url);
          } else {
              console.error('[AuthStore] checkAuthStatus: Auth check failed:', error);
          }
      }
      set({ isLoggedIn: false, user: null, isLoading: false });
    }
  },
}));

export default useAuthStore;