// src/pages/UsersPage.tsx
import { useState } from 'react'; // useState をインポート
import { useQuery, keepPreviousData } from '@tanstack/react-query'; // keepPreviousData をインポート
import apiClient from '@/lib/apiClient';
import { Link } from 'react-router-dom'; // Link をインポート
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Avatar コンポーネントをインポート
import { Terminal, Loader2, MapPin, Briefcase, Users, User, MessageSquare } from "lucide-react"; // アイコンを追加
import axios, { AxiosError } from 'axios';
import { formatRelativeTime } from '@/lib/utils'; // 日付フォーマット関数
import { SimpleUserInfo } from '@/types/user'; // 新しい型定義をインポート
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import useDocumentTitle from '@/hooks/useDocumentTitle'; // ★ カスタムフックをインポート

// APIレスポンスの型定義
interface PaginatedUsersResponse {
    current_page: number;
    data: SimpleUserInfo[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

// ユーザーリストを取得する非同期関数
const fetchUsers = async (page = 1): Promise<PaginatedUsersResponse> => {
  const response = await apiClient.get<PaginatedUsersResponse>('/api/users', {
    params: { page: page }
  });
  return response.data;
};

function UsersPage() {
  useDocumentTitle('Aqsh Terrace | Members'); // ★ フックを呼び出す
  // 現在のページ番号を state で管理
  const [currentPage, setCurrentPage] = useState(1);

  // useQuery フックを使用してデータを取得
  const {
      data: usersData, // ページネーション情報を含むデータ
      isLoading,
      isError,
      error,
      isFetching // ページ遷移時のローディング状態
  } = useQuery<PaginatedUsersResponse, AxiosError | Error>({
    // クエリキーにページ番号を含める
    queryKey: ['users', currentPage],
    queryFn: () => fetchUsers(currentPage), // 現在のページ番号で取得
    placeholderData: keepPreviousData, // ページ遷移時に前のデータを表示
    staleTime: 1000 * 60 * 5, // 5分間キャッシュを新鮮とみなす (任意)
  });

  // --- ローディング・エラーハンドリング ---
  if (isLoading) {
    return <div className="p-4 text-center">ユーザー情報を読み込み中... <Loader2 className="inline animate-spin h-4 w-4" /></div>;
  }
  if (isError) {
     const isAxiosErr = axios.isAxiosError(error);
     const errorMessage = error.message;
     const statusCode = isAxiosErr ? (error as AxiosError).response?.status : null;
     return (
        <Alert variant="destructive" className="my-4 container max-w-3xl">
         <Terminal className="h-4 w-4" />
         <AlertTitle>エラー</AlertTitle>
         <AlertDescription>
           ユーザー情報の読み込み中にエラーが発生しました: {errorMessage}
           {statusCode === 401 && ' (アクセス権限がありません)'}
            {/* エラー時に最初のページに戻るボタン */}
           {currentPage > 1 && (
               <Button variant="link" onClick={() => setCurrentPage(1)} className='p-0 h-auto ml-2'>最初のページに戻る</Button>
           )}
         </AlertDescription>
       </Alert>
     );
  }
  if (!isLoading && !isError && !usersData) {
      return <div className="p-4 text-center text-muted-foreground">ユーザーデータを取得できませんでした。</div>;
  }

  // ユーザーデータが空の場合の表示
  if (usersData && usersData.data.length === 0 && usersData.current_page === 1) {
     return <div className="p-4 text-center text-muted-foreground">ユーザーが見つかりません。</div>;
  } else if (usersData && usersData.data.length === 0 && usersData.current_page > 1) {
     return <div className="p-4 text-center text-muted-foreground">このページにはユーザーがいません。</div>;
  }

  // --- ユーザーリスト表示 ---
  return (
    <div className="p-4"> {/* コンテナと最大幅を設定 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
         {/* フェッチ中スピナー */}
         {isFetching && <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />}
      </div>

       {/* ユーザーカードのグリッド表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* gapを少し広げる */}
        {usersData?.data?.map((user: SimpleUserInfo) => (
          <Link key={user.id} to={`/users/${user.id}`} className="block group"> {/* group を追加してホバー効果をつけやすくする */}
            <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-xl group-hover:border-primary/50">
              {/* PC (md以上) では左右2カラム、スマホでは縦積み */}
              <div className="md:flex h-full">
                {/* 左側: アバター (PC) */}
                <div className="md:w-1/3 relative overflow-hidden bg-muted/30 group-hover:opacity-90 transition-opacity"> {/* relative と overflow-hidden を追加 */}
                  {user.profile_image_url ? (
                    <img
                      src={user.profile_image_url}
                      alt={user.name}
                      // 画像をコンテナいっぱいに表示し、アスペクト比を維持してカバー
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    // 画像がない場合のフォールバック (アイコンやイニシャルなど)
                    <div className="absolute inset-0 w-full h-full flex justify-center items-center bg-gradient-to-br from-primary/10 to-secondary/10 text-primary/50">
                      <User className="h-16 w-16 md:h-20 md:w-20" />
                      {/* またはイニシャル */}
                      {/* <span className="text-5xl font-semibold">{user.name?.charAt(0).toUpperCase()}</span> */}
                    </div>
                  )}
                  {/* スマホ表示時用の画像 (もしPCとスマホでレイアウトを変えたい場合) */}
                  {/* この例ではPCのみこのスタイルを適用し、スマホはデフォルトの縦積みを想定 */}
                  {/* もしスマホでも画像を目立たせたいなら、このimgタグをmd:hiddenにして、別途スマホ用画像エリアを作るなど */}
                </div>

                {/* 右側: ユーザー情報 (PC) / またはアバターの下 (スマホ) */}
                <div className="md:w-2/3 p-4 md:p-5 flex flex-col">
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
                      {user.name}
                    </CardTitle>
                    {user.headline && (
                      <CardDescription className="text-sm text-muted-foreground mt-1 line-clamp-3">
                        {user.headline}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="p-0 text-sm text-muted-foreground flex-grow space-y-1.5 mt-3">
                    {user.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-primary/80" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {(user.posts_count !== undefined || user.followers_count !== undefined) && (
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-1">
                        {user.posts_count !== undefined && (
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1 text-primary/80" />
                            {user.posts_count} <span className="ml-0.5 hidden sm:inline">投稿</span>
                          </span>
                        )}
                        {user.followers_count !== undefined && (
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-primary/80" />
                            {user.followers_count} <span className="ml-0.5 hidden sm:inline">フォロワー</span>
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <div className="text-xs text-muted-foreground/80 mt-auto pt-3"> {/* mt-autoで一番下に配置 */}
                    メンバー登録: {formatRelativeTime(user.created_at)}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* ページネーション UI */}
      {usersData && usersData.last_page > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={!usersData.prev_page_url || isFetching}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            ページ {usersData.current_page} / {usersData.last_page}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, usersData.last_page))}
            disabled={!usersData.next_page_url || isFetching}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}

export default UsersPage;