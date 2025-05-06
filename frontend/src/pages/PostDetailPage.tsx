// src/pages/PostDetailPage.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
// ★★★ useQueryClient, useMutation をインポート ★★★
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from '@/components/ui/button';
// ★★★ Heart アイコンと cn 関数、Loader2 をインポート ★★★
import { Terminal, MoreHorizontal, Loader2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
// ★★★ ここまで ★★★
import axios, { AxiosError } from 'axios';
import useAuthStore from '@/stores/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PostEditDialog } from '@/components/PostEditDialog';
import { PostDeleteAlert } from '@/components/PostDeleteAlert';
// ★★★ 更新された Post 型をインポート ★★★
import type { Post } from '@/types/post';
import { CommentForm } from '@/components/CommentForm';
import { CommentList } from '@/components/CommentList';
import { formatRelativeTime } from '@/lib/utils';
// ★★★ エラー通知用 (例: Sonner トースト) ★★★
// import { toast } from "sonner";

// ★★★ いいね/いいね解除を行う非同期関数 ★★★
interface LikeVariables {
  postId: number;
  liked: boolean;
}
const toggleLike = async ({ postId, liked }: LikeVariables) => {
  const endpoint = `/api/posts/${postId}/like`;
  if (liked) {
    await apiClient.delete(endpoint);
  } else {
    await apiClient.post(endpoint);
  }
};

// --- 単一投稿を取得する非同期関数 ---
// ★★★ 修正: fetchPost を動作していた時の想定 (直接 Post を返す) に戻す ★★★
interface PostApiResponse { data: Post; }

const fetchPost = async (postId: string | undefined): Promise<Post> => {
  if (!postId) {
    throw new Error("投稿IDが指定されていません。");
  }
  // ★ 型引数を <PostApiResponse> に変更 ★
  const response = await apiClient.get<PostApiResponse>(`/api/posts/${postId}`);
  // レスポンスデータ自体が存在するかチェック (念のため)
  if (!response.data || !response.data.data) {
    // このエラーメッセージは状況に応じて調整
    throw new Error('Post data not found in response');
  }
  // ★ response.data を直接返す ★
  return response.data.data;
};
// ★★★ ここまで修正 ★★★


function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // ★ QueryClient インスタンスを取得 ★

  // postId が string であることを確認 (useParams の型が string | undefined の場合)
  const currentPostId = postId ? parseInt(postId, 10) : undefined;

  const { data: post, isLoading, isError, error, isFetching } = useQuery<Post, AxiosError | Error>({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
    enabled: !!postId, // postId が存在する場合のみ実行
  });

  // ★★★ いいね/いいね解除用の Mutation ★★★
  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onSuccess: (_, variables) => {
      const { liked } = variables;
      // ★★★ 詳細ページのキャッシュ ['post', postId] を更新 ★★★
      queryClient.setQueryData<Post>(['post', postId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          liked_by_user: !liked,
          likes_count: liked ? oldData.likes_count - 1 : oldData.likes_count + 1,
        };
      });
      // ★★★ 投稿一覧のキャッシュも無効化 or 更新 (任意) ★★★
      // ユーザーが一覧に戻ったときに最新の状態が表示されるように
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      console.log(`Post ${postId} like status updated successfully.`);
      // toast.success(liked ? "いいねを取り消しました" : "いいねしました！");
    },
    onError: (error: any, variables) => {
      console.error("Like toggle error:", error);
      // toast.error(variables.liked ? "いいねの取り消しに失敗しました。" : "いいねに失敗しました。");
      // ★ エラー時はサーバーの状態に同期させる (キャッシュを再取得) ★
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });


  // --- ローディング・エラーハンドリング ---
  if (isLoading) {
    return <div className="p-4 text-center">投稿を読み込み中... <Loader2 className="inline animate-spin h-4 w-4" /></div>;
  }
  // ★★★ エラー発生時のログを追加 ★★★
  if (isError) {
    console.error("Error fetching post:", error); // ★ コンソールにエラーを出力 ★
    const isAxiosErr = axios.isAxiosError(error);
    const errorMessage = error.message;
    const statusCode = isAxiosErr ? error.response?.status : null;
    return (
      <Alert variant="destructive" className="my-4 max-w-3xl">
        <Terminal className="h-4 w-4" />
        <AlertTitle>エラー</AlertTitle>
        <AlertDescription>
          投稿の読み込み中にエラーが発生しました: {errorMessage}
          {statusCode && ` (コード: ${statusCode})`} {/* ステータスコードも表示 */}
          {statusCode === 401 && ' (ログインが必要です)'}
          {statusCode === 404 && ' (投稿が見つかりません)'}
        </AlertDescription>
        <div className="mt-4">
            <Button asChild variant="outline" size="sm">
              <Link to="/">ホームページへ</Link>
            </Button>
        </div>
      </Alert>
    );
  }
  // ★★★ post が falsy な場合のログを追加 ★★★
  if (!post) {
    // isLoading, isError が false でも post が存在しないケースは useQuery の初期状態など
    // エラーとは限らないので、必ずしも警告ではないかもしれないが、デバッグ用に残す
    console.warn("Post data is falsy after query completed without error. isLoading:", isLoading, "isError:", isError); // ★ 警告ログ ★
    return <div className="p-4 text-center text-muted-foreground">投稿データを表示できませんでした。</div>; // メッセージ変更
  }

  const handlePostDeleted = () => {
    console.log('Post deleted, navigating home.');
    navigate('/');
  };

  // --- レンダリング ---
  // ★ レンダリング前に post オブジェクトをログに出力してみる ★
  console.log("Rendering PostDetailPage with post:", post);

  return (
    <div className="max-w-3xl p-4 space-y-6">
      <Button asChild variant="outline" size="sm">
         <Link to="/">← 投稿一覧へ戻る</Link>
      </Button>

      <div className="border rounded-lg p-6 shadow-sm bg-card text-card-foreground">
         <div className="flex justify-between items-start mb-4">
            <div className="flex-1 mr-4">
                {/* 投稿本文 */}
                <p className="mb-4 whitespace-pre-wrap text-lg break-words">{post.body}</p>

                {/* ★★★ いいねボタンといいね数を追加 (詳細ページ用) ★★★ */}
                <div className="mt-4 flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "flex items-center space-x-1 px-2 py-1 h-auto",
                            "text-muted-foreground hover:text-red-500 disabled:opacity-50",
                            post.liked_by_user && "text-red-500"
                        )}
                        // ★★★ onClick ハンドラで mutation を実行 ★★★
                        onClick={() => {
                           if (currentUser && currentPostId !== undefined) { // currentPostId もチェック
                             likeMutation.mutate({ postId: currentPostId, liked: post.liked_by_user });
                           } else if (!currentUser) {
                             // toast.info("いいねするにはログインが必要です。");
                             console.log("Please log in to like posts.");
                           }
                         }}
                         // ★★★ mutation 実行中も disabled に ★★★
                         disabled={!currentUser || isFetching || likeMutation.isPending}
                    >
                        <Heart
                            className={cn(
                                'h-4 w-4',
                                post.liked_by_user ? 'fill-current' : ''
                            )}
                        />
                        <span className="sr-only">{post.liked_by_user ? 'いいねを取り消す' : 'いいねする'}</span>
                        {/* 詳細ページでは数を隣に表示 */}
                        {post.likes_count > 0 && (
                             <span className="text-xs font-medium ml-1">{post.likes_count}</span>
                        )}
                    </Button>
                </div>
                {/* ★★★ ここまで ★★★ */}

                {/* 投稿メタ情報 */}
                <div className="text-sm text-muted-foreground flex flex-col sm:flex-row justify-between items-start sm:items-center border-t pt-4 mt-4 space-y-1 sm:space-y-0">
                    <span>
                        投稿者:
                        {post.user ? (
                            <Link to={`/users/${post.user.id}`} className="ml-1 text-primary hover:underline">
                                {post.user.name}
                            </Link>
                        ) : ( <span className="ml-1">不明</span> )}
                    </span>
                    <time dateTime={post.created_at} title={new Date(post.created_at).toLocaleString('ja-JP')}>
                        {formatRelativeTime(post.created_at)}
                    </time>
                </div>
            </div>

            {/* 編集・削除メニュー */}
            {currentUser && post.user && currentUser.id === post.user.id && (
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Dialog>
                      <DialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()}>編集</DropdownMenuItem>
                      </DialogTrigger>
                      <PostEditDialog post={post} />
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <DropdownMenuItem onSelect={(e: Event) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">削除</DropdownMenuItem>
                      </AlertDialogTrigger>
                      <PostDeleteAlert postId={post.id} onDeleted={handlePostDeleted} />
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
         </div>
      </div>

      {/* コメントセクション */}
      <div className="mt-8">
         {/* currentUser と post.id の存在を確認してからレンダリング */}
         {currentUser && post?.id && (
            <CommentForm postId={post.id} />
         )}
         {/* post.id の存在を確認してからレンダリング */}
         {post?.id && (
            <CommentList postId={post.id} />
         )}
      </div>
    </div>
  );
}
export default PostDetailPage;