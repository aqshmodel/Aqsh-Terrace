// src/stores/authStore.ts
import { create } from 'zustand';

// ★ UserData 型の email をオプショナルにする ★
interface UserData {
  id: number;
  name: string;
  email?: string; // ← email プロパティ名の後に ? を追加してオプショナルにする
}

interface AuthState {
  isLoggedIn: boolean;
  user: UserData | null;
  login: (userData: UserData) => void; // 引数の型は UserData のまま
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  // login アクションの実装は変更なし。渡された userData をそのままセットする。
  // email が undefined の UserData も受け入れられるようになる。
  login: (userData) => set({ isLoggedIn: true, user: userData }),
  logout: () => set({ isLoggedIn: false, user: null }),
}));

export default useAuthStore;