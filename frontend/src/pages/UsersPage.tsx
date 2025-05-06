// src/pages/UsersPage.tsx
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient'; // 作成した API クライアントをインポート

// API から返ってくるユーザーデータの型定義 (仮)
interface User {
  id: number;
  name: string;
  email: string;
}

// ユーザーリストを取得する非同期関数
const fetchUsers = async (): Promise<User[]> => {
  // apiClient を使って GET リクエストを送信
  // Vite プロキシを経由するため、パスに '/api' を含める
  const response = await apiClient.get('/api/users');
  return response.data; // レスポンスの data プロパティにユーザーリストが入っている
};

function UsersPage() {
  // useQuery フックを使用してデータを取得
  const { data: users, isLoading, isError, error } = useQuery<User[], Error>({
    queryKey: ['users'], // クエリの一意なキー (配列で指定)
    queryFn: fetchUsers, // データを取得する非同期関数
  });

  // ローディング中の表示
  if (isLoading) {
    return <div className="p-4">ユーザー情報を読み込み中...</div>;
  }

  // エラー発生時の表示
  if (isError) {
    return <div className="p-4 text-destructive">エラーが発生しました: {error.message}</div>;
  }

  // データ取得成功時の表示
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ユーザー一覧</h1>
      {users && users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user.id} className="mb-2 border-b pb-1">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>ユーザーが見つかりません。</p>
      )}
    </div>
  );
}

export default UsersPage;