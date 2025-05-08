// src/components/PostList.tsx
import { useState, Dispatch, SetStateAction } from 'react'; // Reactをインポート
import { useQuery, keepPreviousData, useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
import { Terminal, MoreHorizontal, Loader2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PostEditDialog } from './PostEditDialog';
import { PostDeleteAlert } from './PostDeleteAlert';
import type { Post, UserInfo } from '@/types/post';
import { formatRelativeTime } from '@/lib/utils';

// --- ページネーションの型定義 ---
interface PaginatedResponseData<T = Post> {
  current_page?: number;
  data: T[];
  first_page_url?: string | null;
  from?: number | null;
  last_page?: number;
  last_page_url?: string | null;
  links?: {
      url?: string | null;
      label?: string;
      active?: boolean;
      first?: string | null;
      last?: string | null;
      prev?: string | null;
      next?: string | null;
  }[] | any; // any は望ましくないが、柔軟性のため一時的に許容
  next_page_url?: string | null;
  path?: string;
  per_page?: number;
  prev_page_url?: string | null;
  to?: number | null;
  total?: number;
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: any[];
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

// --- Props の型定義 ---
interface PostListProps {
  postsData?: PaginatedResponseData;
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: Error | AxiosError | null;
  setPage?: Dispatch<SetStateAction<number>>;
  onLikeToggleSuccess?: (postId: number, newLikedStatus: boolean, newLikesCount: number) => void;
  onLikeToggleError?: (error: Error, postId: number) => void;
  currentUser?: UserInfo | null;
  queryKeyPrefix?: string;
  fetchFn?: (page: number) => Promise<PaginatedResponseData>;
}

// --- いいね/いいね解除を行う非同期関数 ---
interface LikeVariables { postId: number; liked: boolean; }
const toggleLike = async ({ postId, liked }: LikeVariables) => {
  const endpoint = `/api/posts/${postId}/like`;
  try {
    if (liked) {
      await apiClient.delete(endpoint);
      console.log(`[API] Like removed successfully for post ${postId}`);
    } else {
      await apiClient.post(endpoint);
      console.log(`[API] Like added successfully for post ${postId}`);
    }
  } catch (error) {
      console.error(`[API] Failed to toggle like for post ${postId}:`, error);
      throw error;
  }
};

// --- デフォルトで使用する投稿一覧取得関数 ---
const fetchPosts = async (page: number): Promise<PaginatedResponseData> => {
  console.log(`Fetching posts (default fetcher) for page: ${page}`);
  const response = await apiClient.get<any>('/api/posts', { // APIレスポンス型は適宜調整
    params: { page: page }
  });
   console.log('[API Response /api/posts]:', response.data);
  return response.data as PaginatedResponseData;
};

// --- コンポーネント本体 ---
export function PostList({
  postsData: postsDataProp,
  isLoading: isLoadingProp,
  isFetching: isFetchingProp,
  isError: isErrorProp,
  error: errorProp,
  setPage: setPageProp,
  onLikeToggleSuccess,
  onLikeToggleError,
  currentUser: currentUserProp,
  queryKeyPrefix = 'posts',
  fetchFn = fetchPosts
}: PostListProps) {

  const queryClient = useQueryClient();
  const [currentPageInternal, setCurrentPageInternal] = useState(1);
  const loggedInUser = useAuthStore((state) => state.user);
  const currentUser = currentUserProp ?? loggedInUser;
  const isExternalDataMode = postsDataProp !== undefined;

  const {
    data: fetchedData,
    isLoading: isLoadingInternal,
    isError: isErrorInternal,
    error: errorInternal,
    isFetching: isFetchingInternal
  } = useQuery<PaginatedResponseData, AxiosError | Error>({
    queryKey: [queryKeyPrefix, currentPageInternal],
    queryFn: () => fetchFn(currentPageInternal),
    enabled: !isExternalDataMode,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30, // 30 seconds
  });

  const postsData = isExternalDataMode ? postsDataProp : fetchedData;
  const isLoading = isExternalDataMode ? (isLoadingProp ?? false) : isLoadingInternal;
  const isFetching = isExternalDataMode ? (isFetchingProp ?? false) : isFetchingInternal;
  const isError = isExternalDataMode ? (isErrorProp ?? false) : isErrorInternal;
  const error = isExternalDataMode ? errorProp : errorInternal;
  const handlePageChange = setPageProp ?? setCurrentPageInternal;

  const currentPageNumber = postsData?.meta?.current_page ?? postsData?.current_page ?? 1;

  const likeMutation = useMutation<void, Error, LikeVariables>({
    mutationFn: toggleLike,
    onSuccess: (_, variables) => {
      const { postId, liked } = variables;
      const newLikedStatus = !liked;
      if (onLikeToggleSuccess) {
        const post = postsData?.data?.find(p => p.id === postId);
        if (post) {
            const newLikesCount = liked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1;
            onLikeToggleSuccess(postId, newLikedStatus, newLikesCount);
        } else {
            onLikeToggleSuccess(postId, newLikedStatus, -1); // Post not found, handle appropriately
        }
      } else {
        const queryKeyToUpdate = [queryKeyPrefix, currentPageInternal];
        queryClient.setQueryData<PaginatedResponseData>(queryKeyToUpdate, (oldData) => {
          if (!oldData) return oldData;
          const newData = oldData.data.map(p => {
            if (p.id === postId) {
              return {
                ...p,
                liked_by_user: newLikedStatus,
                likes_count: liked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
              };
            }
            return p;
          });
          return { ...oldData, data: newData };
        });
        queryClient.invalidateQueries({ queryKey: queryKeyToUpdate }); // ★★★ この行を追加 ★★★
      }
    },
    onError: (error, variables) => {
      console.error(`[Mutation Error] Like toggle failed for post ${variables.postId}:`, error);
      if (onLikeToggleError) {
        onLikeToggleError(error, variables.postId);
      } else {
        // Fallback: invalidate query to refetch, though optimistic update failed
        const queryKeyToInvalidate = [queryKeyPrefix, currentPageInternal];
        queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      }
    },
  });

  // --- ローディング・エラーハンドリング ---
  if (isLoading && !isFetching) { // isFetching が false の初回ロード時のみ表示
    return (
      <div className="p-4 text-center">
        投稿を読み込み中... <Loader2 className="inline animate-spin h-4 w-4" />
      </div>
    );
  }

  if (isError) {
     const isAxiosErr = axios.isAxiosError(error);
     const errorMessage = error?.message || '不明なエラー';
     const statusCode = isAxiosErr ? (error as AxiosError).response?.status : null;
     const pageOnError = currentPageNumber ?? 1;
     return (
        <Alert variant="destructive" className="my-4">
         <Terminal className="h-4 w-4" />
         <AlertTitle>エラー</AlertTitle>
         <AlertDescription>
           投稿の読み込み中にエラーが発生しました: {errorMessage}
           {statusCode === 401 && ' (ログインが必要です)'}
           {pageOnError > 1 && (
               <Button variant="link" onClick={() => handlePageChange(1)} className='p-0 h-auto ml-2'>最初のページに戻る</Button>
           )}
         </AlertDescription>
       </Alert>
     );
  }

  if (!isLoading && !postsData) {
      return (
        <div className="p-4 text-center text-muted-foreground">
          投稿データを取得できませんでした。
        </div>
      );
  }

  const lastPageNumber = postsData?.meta?.last_page ?? postsData?.last_page ?? 1;

  // データ配列が空の場合の表示
  if (postsData && postsData.data.length === 0 && currentPageNumber === 1) {
     return (
       <div className="p-4 text-center text-muted-foreground">
         まだ投稿がありません。
       </div>
     );
  } else if (postsData && postsData.data.length === 0 && currentPageNumber > 1) {
     return (
       <div className="p-4 text-center text-muted-foreground">
         このページには投稿がありません。
       </div>
     );
  }

  // --- 投稿リスト表示 ---
  return (
    <div className="space-y-4">
      {isFetching && (
        <div className="text-center py-2 text-muted-foreground">
          <Loader2 className="inline animate-spin h-4 w-4" /> 更新中...
        </div>
      )}

      {postsData?.data?.map((post) => (
        <div key={post.id} className="border rounded-md p-4 shadow-sm bg-card text-card-foreground">
         <div className="flex justify-between items-start space-x-2">
           <div className="flex-1 min-w-0">
             <Link to={`/posts/${post.id}`} className="hover:underline">
                <p className="mb-2 whitespace-pre-wrap break-words">{post.body}</p>
             </Link>
             <div className="text-sm text-muted-foreground flex flex-wrap justify-between items-center gap-x-4 gap-y-1 mt-2">
               <span>
                 投稿者:
                 {post.user ? (
                   <Link to={`/users/${post.user.id}`} className="ml-1 text-primary hover:underline font-medium">
                     {post.user.name}
                   </Link>
                 ) : ( <span className="ml-1 italic">不明</span> )}
               </span>
               <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString('ja-JP')}>
                 {formatRelativeTime(post.created_at)}
               </time>
             </div>
             <div className="mt-3 flex items-center space-x-1">
                <Button
                   variant="ghost" size="sm"
                   className={cn(
                     "flex items-center space-x-1 px-2 py-1 h-auto rounded-md text-muted-foreground hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed",
                     post.liked_by_user && "text-red-500"
                   )}
                   onClick={() => {
                     if (currentUser) {
                       likeMutation.mutate({ postId: post.id, liked: post.liked_by_user });
                     } else {
                       console.log("Login required to like");
                       // ここでログインページへリダイレクトするなどの処理も可能
                     }
                   }}
                   disabled={!currentUser || likeMutation.isPending || isFetching}
                   aria-pressed={post.liked_by_user}
                >
                   <Heart className={cn('h-4 w-4', post.liked_by_user ? 'fill-current' : 'fill-none')} aria-hidden="true" />
                   <span className="sr-only">{post.liked_by_user ? 'いいねを取り消す' : 'いいねする'}</span>
                   <span className="text-xs font-medium tabular-nums">
                     {post.likes_count > 0 ? post.likes_count : ''}
                   </span>
                </Button>
             </div>
           </div>
           {currentUser && post.user && currentUser.id === post.user.id && (
             <div className="flex-shrink-0">
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-8 w-8">
                     <span className="sr-only">投稿メニューを開く</span>
                     <MoreHorizontal className="h-4 w-4" />
                   </Button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-40">
                   <DropdownMenuItem asChild>
                     <Link to={`/posts/${post.id}`}>詳細を見る</Link>
                   </DropdownMenuItem>
                   <Dialog>
                     <DialogTrigger asChild>
                       <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>編集</DropdownMenuItem>
                     </DialogTrigger>
                     <PostEditDialog post={post} />
                   </Dialog>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()} // メニューが閉じるのを防ぐ
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    {/* PostDeleteAlert が AlertDialogContent をレンダリングすると仮定 */}
                    <PostDeleteAlert postId={post.id} />
                    </AlertDialog>
                 </DropdownMenuContent>
               </DropdownMenu>
             </div>
           )}
         </div>
        </div>
      ))}

      {postsData && lastPageNumber > 1 && (
        <div className="mt-6 flex justify-center items-center space-x-2">
          <Button
            variant="outline" size="sm"
            onClick={() => handlePageChange((prev) => Math.max(prev - 1, 1))}
            disabled={!(postsData?.prev_page_url ?? (postsData?.links && typeof postsData.links === 'object' && 'prev' in postsData.links && postsData.links.prev)) || isFetching || likeMutation.isPending}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            ページ {currentPageNumber ?? '?'} / {lastPageNumber ?? '?'}
          </span>
          <Button
            variant="outline" size="sm"
            onClick={() => handlePageChange((prev) => prev + 1)}
            disabled={!(postsData?.next_page_url ?? (postsData?.links && typeof postsData.links === 'object' && 'next' in postsData.links && postsData.links.next)) || isFetching || likeMutation.isPending}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}