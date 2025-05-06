// src/layouts/Layout.tsx
import { Link, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/apiClient';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Bell, Loader2 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { UnreadCountResponse } from '@/types/notification';
import NotificationDropdownContent from '@/components/NotificationDropdownContent';

// --- WebSocket 関連のインポート ---
import echo from '@/lib/echo'; // 作成した Echo インスタンス
import { useToast } from "./../hooks/use-toast"; // 相対パスに変更 (Layout.tsx から hooks ディレクトリへの相対パス)
import { Toaster } from "@/components/ui/toaster"; // Toast を表示するコンポーネント

// --- 通知データの型定義 (WebSocket 受信データ用) ---
interface BaseNotificationData {
    // Laravel Notification の toBroadcast で送られる共通的なデータ構造を想定
    message: string;
    notification_id: string; // Laravel Notification の UUID
    read_at: string | null;
    created_at: string;
    // type は toBroadcast で明示的に含めるか、クラス名から自動で付与される場合がある
    // type: string;
}

interface CommentReceivedNotificationData extends BaseNotificationData {
    // CommentReceived の toBroadcast で定義したデータ
    comment_id: number;
    comment_body: string;
    commenter_id: number;
    commenter_name: string;
    post_id: number;
    post_owner_id: number; // 念のため追加した情報
    // 必要に応じて type プロパティも定義
    type?: 'CommentReceived' | 'App\\Notifications\\CommentReceived';
}

// ★ TODO: 他の通知タイプ (PostLiked, UserFollowed など) の型も定義する ★
// interface PostLikedNotificationData extends BaseNotificationData { ... }
// interface UserFollowedNotificationData extends BaseNotificationData { ... }

// 受け取る可能性のある全ての通知タイプの Union 型
type ReceivedNotificationData = CommentReceivedNotificationData /* | PostLikedNotificationData | UserFollowedNotificationData */;


// --- API 関数 (変更なし) ---
const fetchUnreadCount = async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get<UnreadCountResponse>('/api/notifications/unread-count');
    return response.data;
};

const markNotificationsAsRead = async () => {
    await apiClient.post('/api/notifications/mark-as-read');
};


function Layout() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const loginAction = useAuthStore((state) => state.login);
  const logoutAction = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { toast } = useToast(); // ★ Toast フックを取得 ★

  // --- ログイン状態確認 (変更なし) ---
  useEffect(() => {
    const checkUser = async () => {
      if (isLoggedIn || !document.cookie.includes('XSRF-TOKEN')) {
          return;
      }
      try {
        console.log("[Auth] Checking user authentication status...");
        const response = await apiClient.get<{ data: { id: number; name: string; email?: string } }>('/api/user');
        if (response.data && response.data.data) {
          console.log("[Auth] User data fetched, logging in:", response.data.data);
          loginAction(response.data.data);
        } else {
           console.log("[Auth] No user data found, logging out.");
           // logoutAction(); // 既にログアウト状態なら不要かもしれない
        }
      } catch (error: any) {
        if (error.response && (error.response.status === 401 || error.response.status === 419)) {
          console.log("[Auth] User not authenticated (401/419).");
          // Zustand ストアの状態も確実にログアウト状態にする
          if (isLoggedIn) logoutAction();
        } else {
          console.error("[Auth] Error checking user status:", error);
        }
      }
    };
    // 初回レンダリング時と、Cookie があるのに未ログイン状態の場合に実行
    if (!isLoggedIn && document.cookie.includes('XSRF-TOKEN')) {
        checkUser();
    }
    // loginAction, logoutAction は通常不変なので依存配列からは外しても良い場合がある
  }, [isLoggedIn, loginAction, logoutAction]);

  // --- 未読通知数取得 Query (変更なし) ---
  const { data: unreadData, isLoading: isLoadingUnread } = useQuery<UnreadCountResponse, Error>({
      queryKey: ['notifications', 'unread-count'],
      queryFn: fetchUnreadCount,
      enabled: isLoggedIn, // ログイン時のみ有効
      refetchInterval: 60000, // 60秒ごとにポーリング (WebSocket があれば不要になるかも)
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true, // ウィンドウフォーカス時にも再取得
      staleTime: 30000, // 30秒間はキャッシュを新鮮とみなす
  });
  const unreadCount = unreadData?.unread_count ?? 0;

  // --- 通知を既読にする Mutation (変更なし) ---
  const markAsReadMutation = useMutation({
      mutationFn: markNotificationsAsRead,
      onSuccess: () => {
          console.log('[Notifications] Marked as read successfully.');
          // 未読数を即時更新
          queryClient.setQueryData<UnreadCountResponse>(['notifications', 'unread-count'], { unread_count: 0 });
          // 通知リストのキャッシュを無効化 (詳細リスト取得時に再フェッチされる)
          queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
      },
      onError: (error) => {
          console.error('[Notifications] Failed to mark notifications as read:', error);
          toast({
              title: "エラー",
              description: "通知を既読にできませんでした。",
              variant: "destructive",
          });
      }
  });

  // --- ドロップダウン開閉時に既読処理 (変更なし) ---
  useEffect(() => {
      if (isNotificationOpen && unreadCount > 0 && !markAsReadMutation.isPending) {
          console.log('[Notifications] Marking notifications as read due to dropdown open.');
          markAsReadMutation.mutate();
      }
  }, [isNotificationOpen, unreadCount, markAsReadMutation]);


  // --- ログアウト処理 (変更なし) ---
  const handleLogout = async () => {
    try {
      await apiClient.post('/api/logout');
      logoutAction();
      queryClient.removeQueries(); // 全てのクエリキャッシュをクリア（通知含む）
      // WebSocket 接続も切断される (useEffect のクリーンアップで leave される)
      console.log('[Auth] Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.error("[Auth] Logout error:", error);
      // エラーが発生しても強制的にログアウト状態にする
      logoutAction();
      queryClient.removeQueries();
      navigate('/login');
    }
  };

  // --- ★ WebSocket リッスン処理 ★ ---
  useEffect(() => {
    // ログインしていて、ユーザー情報がある場合のみリッスン開始
    if (isLoggedIn && user?.id) {
        const privateChannel = `App.Models.User.${user.id}`;
        console.log(`[WebSocket] Attempting to listen on private channel: ${privateChannel}`);

        try {
            // プライベートチャンネルをリッスン
            echo.private(privateChannel)
                // Laravel Notification イベントをリッスン (.notification())
                .notification((notification: ReceivedNotificationData) => {
                    console.log('[WebSocket] Notification received:', notification);

                    // 1. 未読件数クエリを即時更新 (増加させる)
                    queryClient.setQueryData<UnreadCountResponse>(
                        ['notifications', 'unread-count'],
                        (oldData) => ({ unread_count: (oldData?.unread_count ?? 0) + 1 })
                    );

                    // 2. 通知リストクエリを無効化 (次回取得時に最新になる)
                    queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });

                    // 3. トースト通知を表示
                    toast({
                        title: "新しいお知らせ",
                        description: notification.message, // 通知メッセージを表示
                        // duration: 5000, // 表示時間 (任意)
                    });

                    // 4. (オプション) 通知タイプに応じた追加処理
                    // if (notification.type === 'CommentReceived' || notification.type === 'App\\Notifications\\CommentReceived') {
                    //     const commentNotification = notification as CommentReceivedNotificationData;
                    //     // コメントがついた投稿のコメントリストを無効化するなど
                    //     queryClient.invalidateQueries({ queryKey: ['comments', commentNotification.post_id] });
                    // }
                    // 他の通知タイプ (PostLiked, UserFollowed) のハンドリングもここに追加
                })
                // エラーハンドリング
                .error((error: any) => {
                    console.error(`[WebSocket] Error listening to channel ${privateChannel}:`, error);
                    // 認証エラー (401, 403) などが発生した場合の処理
                    if (error?.status === 401 || error?.status === 403) {
                        console.error(`[WebSocket] Authorization failed (${error.status}). Session might be invalid or permissions missing. Attempting to re-check auth status.`);
                        // 認証状態を再確認し、問題があればログアウトさせる
                        // checkUser(); // checkUser を呼び出すか、直接 logoutAction を呼ぶ
                        if (isLoggedIn) logoutAction(); // 強制ログアウト
                        // エラーによっては Echo が自動で再接続を試みる場合がある
                    }
                    // その他のエラー処理
                });

            console.log(`[WebSocket] Successfully started listening on ${privateChannel}`);

        } catch (error) {
            console.error('[WebSocket] Failed to initialize Echo listener:', error);
        }

        // --- クリーンアップ関数 ---
        // コンポーネントがアンマウントされる時、または依存配列の値 (isLoggedIn, user.id) が変わる前に実行
        return () => {
            if (user?.id) { // user.id が存在する場合のみ leave を試みる
                const leavingChannel = `App.Models.User.${user.id}`;
                console.log(`[WebSocket] Leaving private channel: ${leavingChannel}`);
                try {
                    echo.leave(leavingChannel);
                } catch (leaveError) {
                    console.error(`[WebSocket] Error leaving channel ${leavingChannel}:`, leaveError);
                }
            }
             // 必要であれば Echo 自体の接続を切る
             // echo.disconnect();
        };
    } else {
        // ログインしていない場合やユーザー情報がない場合、
        // 念のため既存のチャンネルから離脱する (通常は上記のクリーンアップで処理される)
        // console.log('[WebSocket] Not logged in or user ID missing, ensuring no active listeners.');
        // // echo.leaveChannel(...) のような明示的な方法があれば使う
        // // もし echo.connector が存在すればチャンネルをループして leave するなど（少し複雑）
    }
    // 依存配列: ログイン状態、ユーザーID、queryClient、toast が変更されたら再実行
  }, [isLoggedIn, user, queryClient, toast, logoutAction]); // logoutAction も依存配列に追加

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2 font-bold">
            {/* アイコンなどを追加しても良い */}
            <span>コミュニティ</span>
          </Link>
          {/* 中央ナビゲーション */}
          <nav className="flex flex-1 justify-center items-center space-x-4 sm:space-x-6 text-sm font-medium">
              <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60">ホーム</Link>
              <Link to="/users" className="hidden sm:inline-block transition-colors hover:text-foreground/80 text-foreground/60">ユーザー</Link>
              <Link to="/about" className="hidden sm:inline-block transition-colors hover:text-foreground/80 text-foreground/60">アバウト</Link>
          </nav>
          {/* 右側の認証・通知エリア */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isLoggedIn && user ? (
              <>
                {/* 通知ドロップダウンメニュー */}
                <DropdownMenu onOpenChange={setIsNotificationOpen} open={isNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full h-9 w-9 sm:h-10 sm:w-10" // サイズ調整
                      aria-label="通知を開く"
                    >
                      <Bell className="h-5 w-5" />
                      {isLoadingUnread ? (
                          <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-muted-foreground" />
                      ) : unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"> {/* サイズ微調整 */}
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                      <span className="sr-only">通知</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0" align="end">
                     {/* 通知ドロップダウンの中身は別コンポーネント */}
                     <NotificationDropdownContent />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* ユーザーメニュー */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         {/* ボタンの padding や Avatar のサイズを微調整 */}
                         <Button variant="ghost" className="relative h-10 px-2 rounded-full flex items-center space-x-2">
                             <Avatar className="h-7 w-7 sm:h-8 sm:w-8"> {/* サイズ調整 */}
                                 <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                                 {/* <AvatarImage src={user.avatarUrl} alt={user.name} /> アバター画像があれば */}
                             </Avatar>
                             <span className="hidden sm:inline text-sm">{user.name}</span>
                         </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                         <DropdownMenuLabel className="font-normal">
                           <div className="flex flex-col space-y-1">
                             <p className="text-sm font-medium leading-none">{user.name}</p>
                             {/* email は任意なので存在チェック */}
                             {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                           </div>
                         </DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                           <Link to={`/users/${user.id}`} className="flex items-center cursor-pointer">
                             <UserIcon className="mr-2 h-4 w-4" />
                             <span>プロフィール</span>
                           </Link>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                           <LogOut className="mr-2 h-4 w-4" />
                           <span>ログアウト</span>
                         </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // 未ログイン時のボタン
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild><Link to="/login">ログイン</Link></Button>
                <Button variant="default" size="sm" asChild><Link to="/register">新規登録</Link></Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1">
          {/* コンテナに左右パディングを追加 */}
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <Outlet />
          </div>
      </main>

      {/* フッター */}
      <footer className="border-t bg-muted/40">
          <div className="container flex flex-col items-center justify-center gap-4 h-24 md:flex-row md:justify-between">
             <p className="text-center text-sm text-muted-foreground md:text-left">
                 © {new Date().getFullYear()} コミュニティプラットフォーム.
             </p>
             {/* フッターにリンクなどを追加しても良い */}
          </div>
      </footer>

      {/* ★ Toast を表示するための Toaster コンポーネント ★ */}
      <Toaster />
    </div>
  );
}

export default Layout;