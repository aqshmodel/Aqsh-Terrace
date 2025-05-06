// src/lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
  }
});

// CSRF Cookie を取得する関数を追加
export const fetchCsrfToken = async () => {
  try {
    // Vite プロキシ経由でリクエスト
    await apiClient.get('/sanctum/csrf-cookie');
    console.log("CSRF cookie fetched successfully."); // 成功ログ
  } catch (error) {
    console.error("Could not fetch CSRF cookie:", error);
    // エラー処理 (必要に応じて)
  }
};

export default apiClient;