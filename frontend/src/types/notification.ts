// frontend/src/types/notification.ts

// Laravel の DatabaseNotification の基本構造
interface BaseNotification {
  id: string; // UUID v4 形式の文字列
  type: string; // 通知クラスの完全修飾名 (例: "App\\Notifications\\CommentReceived")
  notifiable_type: string; // 通常は "App\\Models\\User"
  notifiable_id: number; // 通知を受け取るユーザーの ID
  data: Record<string, any>; // toArray で返されるデータ (詳細はこの後定義)
  read_at: string | null; // 既読日時 (ISO 8601 形式) または null
  created_at: string; // 作成日時 (ISO 8601 形式)
  updated_at: string; // 更新日時 (ISO 8601 形式)
}

// --- 各通知タイプの data プロパティの型定義 ---

// CommentReceived 通知のデータ型
export interface CommentReceivedData {
  comment_id: number;
  comment_body: string; // 短縮された本文
  commenter_id: number;
  commenter_name: string;
  post_id: number;
  message: string; // 表示用メッセージ
}

// PostLiked 通知のデータ型
export interface PostLikedData {
  liker_id: number;
  liker_name: string;
  post_id: number;
  post_body: string; // 短縮された本文
  message: string; // 表示用メッセージ
}

// UserFollowed 通知のデータ型
export interface UserFollowedData {
  follower_id: number;
  follower_name: string;
  message: string; // 表示用メッセージ
}

// --- 結合した通知型 (data プロパティを型ガードで判別可能にする) ---
// 型名の最後の部分で判別できるようにする (例: type.endsWith('CommentReceived'))

export type NotificationData = CommentReceivedData | PostLikedData | UserFollowedData;

// 実際の Notification 型 (data プロパティを具体的な型にする)
// BaseNotification を継承し、data プロパティをオーバーライド
export interface AppNotification extends Omit<BaseNotification, 'data'> {
   // data プロパティの型を、type に応じて判別可能なようにする
   // (より厳密にするなら、type ごとに別のインターフェースを定義する)
   data: NotificationData;
   // type プロパティを使って data の型を絞り込めるようにする
   // 例: if (notification.type.endsWith('CommentReceived')) { ... notification.data as CommentReceivedData ... }
}

// --- 通知 API レスポンスの型 ---

// 通知一覧 (ページネーション付き)
// Laravel の PaginatedResourceResponse に対応
export interface PaginatedNotificationsResponse {
  current_page: number;
  data: AppNotification[]; // 通知データの配列
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

// 未読通知数のレスポンス
export interface UnreadCountResponse {
    unread_count: number;
}