// src/pages/UsersPage.tsx
import { useState } from 'react'; // useState をインポート
import { useQuery, keepPreviousData } from '@tanstack/react-query'; // keepPreviousData をインポート
import apiClient from '@/lib/apiClient';
import { Link } from 'react-router-dom'; // Link をインポート
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Avatar コンポーネントをインポート
import { Terminal, Loader2, MapPin, Briefcase, Users, MessageSquare } from "lucide-react"; // アイコンを追加
import axios, { AxiosError } from 'axios';
import { formatRelativeTime } from '@/lib/utils'; // 日付フォーマット関数
import { SimpleUserInfo, PaginatedUsersResponse } from '@/types/user'; // 新しい型定義をインポート
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// ユーザーリストを取得する非同期関数 (ページ番号を受け取る)
const fetchUsers = async (page = 1): Promise<PaginatedUsersResponse> => {
  console.log(`Fetching users for page: ${page}`);
  const response = await apiClient.get<PaginatedUsersResponse>('/api/users', {
    params: { page: page }
  });
  return response.data; // API レスポンスがページネーション構造になっている想定
};

function UsersPage() {
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

  // ★★★ postsData が確定してから中身にアクセス ★★★
  const currentPageNumber = usersData?.meta?.current_page ?? 1;
  const lastPageNumber = usersData?.meta?.last_page ?? 1;

  // ★ ユーザーデータが空の場合の表示 ★
  if (usersData && usersData.data.length === 0 && currentPageNumber === 1) {
     return <div className="p-4 text-center text-muted-foreground">ユーザーが見つかりません。</div>;
  } else if (usersData && usersData.data.length === 0 && currentPageNumber > 1) {
     return <div className="p-4 text-center text-muted-foreground">このページにはユーザーがいません。</div>;
  }

  // --- ユーザーリスト表示 ---
  return (
    <div className="p-4 container mx-auto max-w-4xl"> {/* コンテナと最大幅を設定 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ユーザー一覧</h1>
         {/* フェッチ中スピナー */}
         {isFetching && <Loader2 className="animate-spin h-5 w-5 text-muted-foreground" />}
      </div>

      {/* ユーザーカードのグリッド表示 (例) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {usersData?.data?.map((user: SimpleUserInfo) => (
          // ユーザープロフィールページへのリンクにする
          <Link key={user.id} to={`/users/${user.id}`} className="block hover:shadow-md transition-shadow duration-200">
            <Card className="h-full flex flex-col"> {/* 高さを揃える */}
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={user.profile_image_url ?? undefined} alt={user.name} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight">{user.name}</CardTitle>
                  {user.headline && <CardDescription className="text-xs mt-1 line-clamp-2">{user.headline}</CardDescription>}
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground flex-grow space-y-1 pt-2">
                 {user.location && (
                    <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1.5 flex-shrink-0" />
                        <span>{user.location}</span>
                    </div>
                 )}
                 {/* カウント情報を表示 */}
                 {(user.posts_count !== undefined || user.followers_count !== undefined || user.followings_count !== undefined) && (
                     <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 pt-1">
                        {user.posts_count !== undefined && <span className="flex items-center"><MessageSquare className="h-3 w-3 mr-0.5" />{user.posts_count} 投稿</span>}
                        {user.followers_count !== undefined && <span className="flex items-center"><Users className="h-3 w-3 mr-0.5" />{user.followers_count} フォロワー</span>}
                        {/* {user.followings_count !== undefined && <span>{user.followings_count} フォロー中</span>} */}
                     </div>
                 )}
                 <div className="pt-1">
                    登録: {formatRelativeTime(user.created_at)}
                 </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* ページネーション UI */}
      {usersData?.meta && lastPageNumber > 1 && (
        <div className="mt-8 flex justify-center items-center space-x-2">
          <Button
            variant="outline" size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={!usersData?.links?.prev || isFetching}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            ページ {currentPageNumber ?? '?'} / {lastPageNumber ?? '?'}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!usersData?.links?.next || isFetching}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}

export default UsersPage;