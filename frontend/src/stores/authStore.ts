import { create } from 'zustand';

interface UserData {
  id: number;
  name: string;
  email?: string; // email はオプショナルのまま
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  isLoading: boolean; // ★ isLoading プロパティを追加 (boolean型)
  login: (userData: UserData) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void; // ★ ローディング状態を更新するためのアクションを追加
  checkAuthStatus: () => Promise<void>; // ★ 認証状態を確認する非同期アクションを追加 (実装は後述)
}

const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,
  isLoading: true, // ★ 初期状態は true (アプリ起動時に認証確認を行うため)
  login: (userData) => set({ isLoggedIn: true, user: userData, isLoading: false }), // ★ login 時に isLoading を false に設定
  logout: () => { // ★ logout 時も isLoading を false に設定
    // ログアウト API 呼び出しなどをここで行う場合は非同期にする
    // 例: await apiClient.post('/api/logout');
    set({ isLoggedIn: false, user: null, isLoading: false });
  },
  setLoading: (loading) => set({ isLoading: loading }), // ★ ローディング状態をセットするアクション

  // ★ 認証状態を確認する非同期アクションの実装例 ★
  checkAuthStatus: async () => {
    if (get().isLoggedIn) { // すでにログイン状態なら何もしない (または user 情報を再取得)
        set({ isLoading: false }); // ローディング完了
        return;
    }
    set({ isLoading: true }); // 確認開始
    try {
        // ここで /api/user などのエンドポイントを叩いて認証状態を確認
        // apiClient.ts をインポートする必要がある
        // import apiClient from '@/lib/apiClient';
        // const response = await apiClient.get<{ data: UserData }>('/api/user');
        // set({ isLoggedIn: true, user: response.data.data, isLoading: false });

        // --- ↓↓↓ ダミー実装 (実際の API 呼び出しに置き換えてください) ---
        // Cookie などに認証情報があるかチェックする想定
        console.log("Checking auth status...");
        await new Promise(resolve => setTimeout(resolve, 500)); // 擬似的な待機
        // 例: ローカルストレージやCookieを見て判断 (これは一例で推奨ではない)
        const maybeAuthenticated = localStorage.getItem('dummy_auth') === 'true'; // ダミー
        if (maybeAuthenticated) {
             // 認証成功とみなし、ダミーユーザー情報をセット
             // 本来は /api/user から取得した情報を使う
            set({ isLoggedIn: true, user: { id: 1, name: 'テストユーザー(復元)' }, isLoading: false });
            console.log("Auth status checked: Logged in (dummy)");
        } else {
             set({ isLoggedIn: false, user: null, isLoading: false });
             console.log("Auth status checked: Not logged in");
        }
        // --- ↑↑↑ ダミー実装ここまで ---

    } catch (error) {
      console.error("Auth check failed:", error);
      set({ isLoggedIn: false, user: null, isLoading: false }); // エラー時もローディング完了
    }
  },
}));

// --- アプリケーション初期化時に認証状態を確認 ---
// この処理は main.tsx や App.tsx のトップレベルに近い場所で一度だけ実行するのが一般的
// useAuthStore.getState().checkAuthStatus();
// console.log("Initial auth check triggered."); // 実行確認用ログ

export default useAuthStore;