// frontend/src/lib/apiClient.ts
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL as string;
let appUrl = import.meta.env.VITE_APP_URL as string;
if (!appUrl && apiUrl) {
    try {
        const url = new URL(apiUrl);
        appUrl = `${url.protocol}//${url.host}`;
    } catch (e) {
        console.error("VITE_API_URL is invalid:", apiUrl);
        appUrl = '';
    }
} else if (!appUrl && !apiUrl) {
    console.error("VITE_APP_URL or VITE_API_URL is not defined in .env file for apiClient setup.");
    appUrl = '';
}


const apiClient = axios.create({
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json', // デフォルトはJSON
  }
});


// リクエストインターセプターを追加
apiClient.interceptors.request.use(
  (config) => {
    console.log('[APIClient Interceptor] Original Content-Type:', config.headers?.['Content-Type']); // ★ 追加
    // リクエストデータが FormData のインスタンスであるかチェック
    if (config.data instanceof FormData) {
      console.log('[APIClient Interceptor] FormData detected. Deleting Content-Type.'); // ★ 追加
      // FormData の場合は Content-Type ヘッダーを削除する
      // これにより、axios が自動的に multipart/form-data と適切な boundary を設定する
      if (config.headers) { // config.headers が存在するか確認
        delete config.headers['Content-Type'];
      }
    }
    console.log('[APIClient Interceptor] Final Content-Type for this request:', config.headers?.['Content-Type']); // ★ 追加
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ★★★ Axiosのデフォルト設定を変更（もし必要なら） ★★★
// デフォルトのtransformRequestを調整して、空のボディでもJSONとして扱われるようにする
// (通常は上記 headers の設定で十分な場合が多い)
/*
apiClient.defaults.transformRequest = [function (data, headers) {
    // Content-Typeが明示的に設定されていなければ、デフォルトで application/json を使うように促す
    if (headers && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    // もし data が空オブジェクトや undefined/null なら空文字列にするか、
    // JSON.stringify するかを決める (空ボディの POST の場合)
    if (data === undefined || data === null || (typeof data === 'object' && Object.keys(data).length === 0)) {
        return null; // ボディなしにする場合
        // return '{}'; // 空のJSONオブジェクトにする場合
    }
    // 通常のデータは JSON 文字列化
    if (typeof data === 'object') {
        try {
            return JSON.stringify(data);
        } catch (e) {
            // handle error
            return data;
        }
    }
    return data;
}, ...(axios.defaults.transformRequest as any[] || [])];
*/


export const fetchCsrfToken = async () => {
  if (!appUrl) {
    console.error("Application URL is not configured for fetching CSRF token.");
    throw new Error("Application URL not configured.");
  }
  try {
    // CSRF取得はapiClientとは別のaxiosインスタンスを使うか、URLをフルで指定
    await axios.get(`${appUrl}/sanctum/csrf-cookie`, { withCredentials: true });

    if (import.meta.env.DEV) {
        console.log("CSRF cookie fetched successfully (or request sent to: " + `${appUrl}/sanctum/csrf-cookie` + ").");
    }
  } catch (error) {
    console.error("Could not fetch CSRF cookie from " + `${appUrl}/sanctum/csrf-cookie` + ":", error);
    throw error;
  }
};

export default apiClient;