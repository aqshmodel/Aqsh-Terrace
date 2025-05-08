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
// Menu アイコンを追加
import { LogOut, User as UserIcon, Bell, Loader2, Home, Users, Info, Menu as MenuIcon } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { UnreadCountResponse } from '@/types/notification';
import NotificationDropdownContent from '@/components/NotificationDropdownContent';

// --- WebSocket 関連のインポート ---
import echo from '@/lib/echo';
import { useToast } from "@/hooks/use-toast"; // パスを修正 (一般的なケース)
import { Toaster } from "@/components/ui/toaster";

// --- 通知データの型定義 ---
interface BaseNotificationData {
    message: string;
    notification_id: string;
    read_at: string | null;
    created_at: string;
    type?: string;
}
interface CommentReceivedNotificationData extends BaseNotificationData {
    comment_id: number;
    comment_body: string;
    commenter_id: number;
    commenter_name: string;
    post_id: number;
    post_owner_id: number;
    type: 'CommentReceived' | 'App\\Notifications\\CommentReceived';
}

type ReceivedNotificationData = CommentReceivedNotificationData;


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
  const isLoadingAuth = useAuthStore((state) => state.isLoading); // isLoadingAuth にリネーム (ローカルのisLoadingと区別)
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { toast } = useToast();

  // ★ モバイルナビゲーション用の状態を追加
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- ログイン状態確認 (変更なし) ---
  useEffect(() => {
    const checkUser = async () => {
      if (isLoggedIn || !document.cookie.includes('XSRF-TOKEN')) {
          return;
      }
      try {
        console.log("[Auth] Checking user authentication status...");
        // userの型定義にprofile_image_urlも追加しておく
        const response = await apiClient.get<{ data: { id: number; name: string; email?: string; profile_image_url?: string; } }>('/api/user');
        if (response.data && response.data.data) {
          console.log("[Auth] User data fetched, logging in:", response.data.data);
          loginAction(response.data.data);
        } else {
           console.log("[Auth] No user data found, logging out.");
           if (isLoggedIn) logoutAction(); // 既にログアウト状態なら不要かもしれないが念のため
        }
      } catch (error: any) {
        if (error.response && (error.response.status === 401 || error.response.status === 419)) {
          console.log("[Auth] User not authenticated (401/419).");
          if (isLoggedIn) logoutAction();
        } else {
          console.error("[Auth] Error checking user status:", error);
        }
      }
    };
    if (!isLoggedIn && document.cookie.includes('XSRF-TOKEN')) {
        checkUser();
    }
  }, [isLoggedIn, loginAction, logoutAction]);

  // --- 未読通知数取得 Query (変更なし) ---
  const { data: unreadData, isLoading: isLoadingUnread } = useQuery<UnreadCountResponse, Error>({
      queryKey: ['notifications', 'unread-count'],
      queryFn: fetchUnreadCount,
      enabled: isLoggedIn,
      refetchInterval: 60000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
      staleTime: 30000,
  });
  const unreadCount = unreadData?.unread_count ?? 0;

  // --- 通知を既読にする Mutation (変更なし) ---
  const markAsReadMutation = useMutation({
      mutationFn: markNotificationsAsRead,
      onSuccess: () => {
          console.log('[Notifications] Marked as read successfully.');
          queryClient.setQueryData<UnreadCountResponse>(['notifications', 'unread-count'], { unread_count: 0 });
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
    if (isLoadingAuth) return; // 認証ストアのisLoadingを使用
    try {
      await logoutAction();
      queryClient.removeQueries();
      console.log('[Auth] Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.error("[Layout] Error occurred during logout:", error);
      if (!window.location.pathname.endsWith('/login')) {
           queryClient.removeQueries();
           navigate('/login');
      }
    }
  };

  // --- WebSocket リッスン処理 (変更なし) ---
  useEffect(() => {
    if (isLoggedIn && user?.id) {
        const privateChannel = `App.Models.User.${user.id}`;
        console.log(`[WebSocket] Attempting to listen on private channel: ${privateChannel}`);

        try {
            echo.private(privateChannel)
                .notification((notification: ReceivedNotificationData) => {
                    console.log('[WebSocket] Notification received:', notification);
                    queryClient.setQueryData<UnreadCountResponse>(
                        ['notifications', 'unread-count'],
                        (oldData) => ({ unread_count: (oldData?.unread_count ?? 0) + 1 })
                    );
                    queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
                    toast({
                        title: "新しいお知らせ",
                        description: notification.message,
                    });
                })
                .error((error: any) => {
                    console.error(`[WebSocket] Error listening to channel ${privateChannel}:`, error);
                    if (error?.status === 401 || error?.status === 403) {
                        console.error(`[WebSocket] Authorization failed (${error.status}). Session might be invalid or permissions missing.`);
                        if (isLoggedIn) logoutAction();
                    }
                });
            console.log(`[WebSocket] Successfully started listening on ${privateChannel}`);
        } catch (error) {
            console.error('[WebSocket] Failed to initialize Echo listener:', error);
        }
        return () => {
            if (user?.id) {
                const leavingChannel = `App.Models.User.${user.id}`;
                console.log(`[WebSocket] Leaving private channel: ${leavingChannel}`);
                try {
                    echo.leave(leavingChannel);
                } catch (leaveError) {
                    console.error(`[WebSocket] Error leaving channel ${leavingChannel}:`, leaveError);
                }
            }
        };
    }
  }, [isLoggedIn, user, queryClient, toast, logoutAction]);

  // --- レンダリング ---
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* ==================== ヘッダー ==================== */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* 左側: モバイルメニュー(md未満) + ロゴ/サイト名 */}
          <div className="flex items-center">
            {/* ★ モバイルナビゲーション用ハンバーガーメニュー (md未満で表示) */}
            <div className="md:hidden mr-2"> {/* md以上で非表示, 右にマージン */}
              <DropdownMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="メインメニューを開く">
                    <MenuIcon className="h-6 w-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={10} className="w-56">
                  <DropdownMenuLabel>Menu</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/" className="flex items-center w-full">
                      <Home className="mr-2 h-4 w-4" /> Home
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/users" className="flex items-center w-full">
                      <Users className="mr-2 h-4 w-4" /> Member
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild onClick={() => setIsMobileMenuOpen(false)}>
                    <Link to="/about" className="flex items-center w-full">
                      <Info className="mr-2 h-4 w-4" /> About
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* ロゴ/サイト名 */}
            <Link to="/" className="flex items-center space-x-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <span>Aqsh Terrace</span>
            </Link>
          </div>

          {/* 中央ナビゲーション (md以上で表示) */}
          {/* `flex-grow` を追加して利用可能なスペースを埋めることで中央寄せを実現 */}
          <nav className="hidden md:flex flex-grow justify-center items-center space-x-20 text-lg font-medium">
              <Link to="/" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
                  <Home className="mr-1.5 h-4 w-4" /> Home
              </Link>
              <Link to="/users" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
                  <Users className="mr-1.5 h-4 w-4" /> Member
              </Link>
              <Link to="/about" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
                  <Info className="mr-1.5 h-4 w-4" /> About
              </Link>
          </nav>

          {/* 右側: 認証・通知エリア */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isLoggedIn && user ? (
              <>
                {/* 通知ドロップダウンメニュー */}
                <DropdownMenu onOpenChange={setIsNotificationOpen} open={isNotificationOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full h-9 w-9"
                      aria-label="通知を開く"
                    >
                      <Bell className="h-5 w-5" />
                      {isLoadingUnread ? (
                          <Loader2 className="absolute -top-1 -right-1 h-4 w-4 animate-spin text-muted-foreground" />
                      ) : unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white bg-red-500 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 p-0" align="end" sideOffset={8}>
                     <NotificationDropdownContent />
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* ユーザーメニュー */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-auto sm:px-2 sm:space-x-2 rounded-full flex items-center">
                             <Avatar className="h-8 w-8 sm:h-8 sm:w-8">
                                 <AvatarImage src={user.profile_image_url ?? undefined} alt={user.name} />
                                 <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : '?'}</AvatarFallback>
                             </Avatar>
                             <span className="hidden sm:inline text-md font-medium">{user.name}</span>
                         </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount sideOffset={8}>
                         <DropdownMenuLabel className="font-normal">
                           <div className="flex flex-col space-y-1">
                             <p className="text-sm font-medium leading-none">{user.name}</p>
                             {user.email && <p className="text-xs leading-none text-muted-foreground">{user.email}</p>}
                           </div>
                         </DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem asChild className="cursor-pointer">
                           <Link to={`/users/${user.id}`} className="flex items-center">
                             <UserIcon className="mr-2 h-4 w-4" />
                             <span>プロフィール</span>
                           </Link>
                         </DropdownMenuItem>
                         <DropdownMenuSeparator />
                         <DropdownMenuItem onClick={handleLogout} disabled={isLoadingAuth} className="text-red-600 focus:bg-red-100 focus:text-red-700 cursor-pointer flex items-center">
                           <LogOut className="mr-2 h-4 w-4" />
                           <span>{isLoadingAuth ? 'ログアウト中...' : 'ログアウト'}</span>
                         </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild><Link to="/login">ログイン</Link></Button>
                <Button variant="default" size="sm" asChild><Link to="/register">新規登録</Link></Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================== メインコンテンツ (変更なし) ==================== */}
      <main className="flex-1 w-full">
          <div className="container mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 py-8 md:py-10">
              <Outlet />
          </div>
      </main>

      {/* ==================== フッター (変更なし) ==================== */}
      <footer className="border-t bg-muted/40">
          <div className="container flex flex-col items-center justify-between gap-4 h-20 max-w-[1360px] px-4 sm:px-6 lg:px-8 md:h-24 md:flex-row">
             <p className="text-center text-sm text-muted-foreground md:text-left">
                 © {new Date().getFullYear()} コミュニティプラットフォーム. All Rights Reserved.
             </p>
             <nav className="flex gap-4 sm:gap-6">
                 <Link to="https://aqsh.co.jp/aqsh-termofservice/" className="text-sm hover:underline underline-offset-4 text-muted-foreground">利用規約</Link>
                 <Link to="https://aqsh.co.jp/privacypolicy/" className="text-sm hover:underline underline-offset-4 text-muted-foreground">プライバシーポリシー</Link>
             </nav>
          </div>
      </footer>

      {/* ==================== Toaster (変更なし) ==================== */}
      <Toaster />
    </div>
  );
}

export default Layout;