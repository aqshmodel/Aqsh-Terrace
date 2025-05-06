// src/components/CommentList.tsx
import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Terminal, Loader2 } from "lucide-react";
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '@/lib/utils';
import type { UserInfo } from '@/types/post';

// コメントデータの型定義
interface Comment {
  id: number;
  body: string;
  created_at: string;
  user: UserInfo;
}

// コメント用ページネーションレスポンス型
interface PaginatedCommentsResponse {
  data: Comment[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

// コメントリスト取得関数
const fetchComments = async (postId: number, page: number): Promise<PaginatedCommentsResponse> => {
  const response = await apiClient.get<PaginatedCommentsResponse>(`/api/posts/${postId}/comments`, {
      params: { page: page }
  });
  return response.data;
};

interface CommentListProps {
  postId: number;
}

export function CommentList({ postId }: CommentListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: commentData, isLoading, isError, error, isFetching } = useQuery<PaginatedCommentsResponse, AxiosError | Error>({
    queryKey: ['comments', postId.toString(), currentPage],
    queryFn: () => fetchComments(postId, currentPage),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60, // コメントは少し長めにキャッシュ (任意)
  });

  // --- ローディング・エラーハンドリング ---
  if (isLoading) {
    return <div className="p-4 text-center text-sm text-muted-foreground">コメントを読み込み中... <Loader2 className="inline animate-spin h-4 w-4" /></div>;
  }
  if (isError) {
     const isAxiosErr = axios.isAxiosError(error);
     const errorMessage = error.message;
     const statusCode = isAxiosErr ? (error as AxiosError).response?.status : null;
     return (
        <Alert variant="destructive" className="my-4">
         <Terminal className="h-4 w-4" />
         <AlertTitle>エラー</AlertTitle>
         <AlertDescription>
           コメントの読み込み中にエラーが発生しました: {errorMessage}
           {statusCode === 401 && ' (ログインが必要です)'}
         </AlertDescription>
       </Alert>
     );
  }
   // ★★★ データなし表示の条件を修正 ★★★
   // commentData が確定してから中身にアクセス
   const currentPageNumber = commentData?.meta?.current_page ?? 1;
   const totalComments = commentData?.meta?.total ?? 0; // total は表示用に保持

   if (!isLoading && !isError && commentData && commentData.data.length === 0 && currentPageNumber === 1) {
       return <div className="p-4 text-center text-sm text-muted-foreground">まだコメントはありません。</div>;
   }
   if (!isLoading && !isError && commentData && commentData.data.length === 0 && currentPageNumber > 1) {
       return <div className="p-4 text-center text-sm text-muted-foreground">このページにはコメントがありません。</div>;
   }
   // commentData がまだ取得できていない場合は何も表示しないか、別のローディング表示
   if (!commentData) {
       return null; // または Minimal Loading Indicator
   }


  // --- コメントリスト表示 ---
  return (
    <div className="mt-6 pt-6 border-t">
       <h3 className="text-lg font-semibold mb-4">
          {/* ★★★ 安全なアクセス ★★★ */}
          コメント ({totalComments}件)
          {isFetching && !isLoading && <Loader2 className="inline ml-2 animate-spin h-4 w-4 text-muted-foreground" />}
       </h3>
       <div className="space-y-4">
         {/* ★★★ 安全なアクセス ★★★ */}
         {commentData?.data?.map((comment) => (
           <div key={comment.id} className="text-sm border-b pb-3 last:border-b-0"> {/* 最後の要素の下線を消す */}
              <p className="whitespace-pre-wrap mb-1">{comment.body}</p>
              <div className="text-xs text-muted-foreground flex justify-between items-center mt-1">
                <span>
                  {comment.user ? (
                     <Link to={`/users/${comment.user.id}`} className="text-primary hover:underline">
                       {comment.user.name}
                     </Link>
                  ) : (
                     '不明'
                  )}
                </span>
                <time dateTime={comment.created_at} title={new Date(comment.created_at).toLocaleString('ja-JP')}>
                  {formatRelativeTime(comment.created_at)}
                </time>
              </div>
           </div>
         ))}
       </div>

       {/* ★★★ コメントのページネーション UI を修正 (安全なアクセス) ★★★ */}
       {commentData?.meta && commentData.meta.last_page > 1 && (
         <div className="mt-6 flex justify-center items-center space-x-2">
           <Button
             variant="outline"
             size="sm"
             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
             disabled={!commentData?.links?.prev || isFetching}
           >
             前へ
           </Button>
           <span className="text-sm text-muted-foreground tabular-nums">
             ページ {commentData.meta.current_page ?? '?'} / {commentData.meta.last_page ?? '?'}
           </span>
           <Button
             variant="outline"
             size="sm"
             onClick={() => setCurrentPage((prev) => prev + 1)}
             disabled={!commentData?.links?.next || isFetching}
           >
             次へ
           </Button>
         </div>
       )}
    </div>
  );
}