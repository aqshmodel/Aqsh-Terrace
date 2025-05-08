// frontend/src/components/NotificationDropdownContent.tsx
import { useQuery} from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { AppNotification, PaginatedNotificationsResponse, CommentReceivedData, PostLikedData, UserFollowedData } from '@/types/notification';
import { formatRelativeTime } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Loader2, MessageSquare, Heart, UserPlus, MailWarning } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"; // ★ インポート ★
import { DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"; // ★ DropdownMenuLabel を追加 ★
import { useState } from 'react'; // ★ useState をインポート ★

// --- 通知一覧を取得する API 関数 ---
const fetchNotifications = async (page: number = 1): Promise<PaginatedNotificationsResponse> => {
    const response = await apiClient.get<PaginatedNotificationsResponse>('/api/notifications', {
        params: { page: page }
    });
    return response.data;
};

export default function NotificationDropdownContent() {
    // ★ useState を使用 ★
    const [currentPage] = useState(1);

    const { data: notificationData, isLoading, isError } = useQuery<PaginatedNotificationsResponse, Error>({
        queryKey: ['notifications', 'list', currentPage],
        queryFn: () => fetchNotifications(currentPage),
        staleTime: 30000,
    });

    const getNotificationDetails = (notification: AppNotification): { icon: React.ElementType, link: string | null, message: string } => {
        const data = notification.data;
        let icon: React.ElementType = MailWarning;
        let link: string | null = null;
        let message = "不明な通知";
        const notificationType = notification.type.split('\\').pop();

        switch (notificationType) {
            case 'CommentReceived':
                icon = MessageSquare;
                link = `/posts/${(data as CommentReceivedData).post_id}`;
                message = (data as CommentReceivedData).message;
                break;
            case 'PostLiked':
                icon = Heart;
                link = `/posts/${(data as PostLikedData).post_id}`;
                message = (data as PostLikedData).message;
                break;
            case 'UserFollowed':
                icon = UserPlus;
                link = `/users/${(data as UserFollowedData).follower_id}`;
                message = (data as UserFollowedData).message;
                break;
            default:
                message = `不明なタイプの通知です: ${notificationType}`;
                break;
        }
        return { icon: icon, link: link, message: message };
    };

    // --- レンダリング ---
    // ★ DropdownMenuLabel を先頭に追加 ★
    return (
        <>
            <DropdownMenuLabel className="px-2 py-1.5">通知</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoading && (
                <div className="p-4 flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    通知を読み込み中...
                </div>
            )}
            {isError && (
                <div className="p-2 text-sm text-red-600">
                    通知の読み込みに失敗しました。
                    {/* : {error.message} */} {/* エラー詳細は省略 */}
                </div>
            )}
            {!isLoading && !isError && (!notificationData || notificationData.data.length === 0) && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    通知はありません。
                </div>
            )}
            {!isLoading && !isError && notificationData && notificationData.data.length > 0 && (
                <ScrollArea className="max-h-[400px]"> {/* スクロールエリア */}
                    <div className="space-y-1 p-1"> {/* パディングを内側に */}
                        {notificationData.data.map((notification) => {
                            const { icon: Icon, link, message } = getNotificationDetails(notification);
                            const isUnread = notification.read_at === null;

                            const NotificationItem = (
                                <div className={`flex items-start p-2 rounded-md space-x-3 ${isUnread ? 'bg-secondary/50' : 'bg-transparent'}`}>
                                    <div className={`mt-1 ${isUnread ? 'text-primary' : 'text-muted-foreground'}`}> <Icon className="h-4 w-4" /> </div>
                                    <div className="flex-1 text-sm">
                                        <p className={`leading-snug ${isUnread ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{message}</p>
                                        <time className="text-xs text-muted-foreground/80" dateTime={notification.created_at} title={new Date(notification.created_at).toLocaleString('ja-JP')}>{formatRelativeTime(notification.created_at)}</time>
                                    </div>
                                </div>
                            );

                            if (link) {
                                return ( <DropdownMenuItem key={notification.id} asChild className="p-0 cursor-pointer"><Link to={link}>{NotificationItem}</Link></DropdownMenuItem> );
                            } else {
                                // リンクがない場合は DropdownMenuItem でラップしない (クリック不可にするため)
                                return ( <div key={notification.id} className="p-0">{NotificationItem}</div> );
                            }
                        })}
                         {/* TODO: ページネーション */}
                    </div>
                </ScrollArea>
            )}
            {/* フッター部分 (例: 全て既読ボタンなど) */}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>
                <Button variant="ghost" size="sm" className="w-full justify-center">すべて既読にする</Button>
            </DropdownMenuItem> */}
        </>
    );
}