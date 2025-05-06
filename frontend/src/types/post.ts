// src/types/post.ts

export interface UserInfo {
  id: number;
  name: string;
  email?: string; // email はオプショナル (authStore に合わせた)
}

// ★ Post 型に updated_at, likes_count, liked_by_user を追加 ★
export interface Post {
  id: number;
  body: string;
  created_at: string;
  updated_at: string; // PostResource で返しているので追加 (もし未定義の場合)
  user: UserInfo; // 投稿者情報
  likes_count: number; // いいねの数
  liked_by_user: boolean; // ログイン中のユーザーがいいねしているか
}

// ★★★ PaginatedPostsResponse 型の定義を修正 ★★★
export interface PaginatedPostsResponse {
  data: Post[]; // 投稿データの配列

  // ★ links プロパティをオブジェクト型に変更 ★
  links: {
    first: string | null;
    last: string | null;
    prev: string | null; // 'prev' を追加
    next: string | null; // 'next' を追加
  };

  // ★ meta プロパティを追加 ★
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>; // meta.links はこのまま
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

// コメントの型定義 (変更なし)
export interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: UserInfo;
}

// ★★★ PaginatedCommentsResponse も同様に修正する場合 ★★★
export interface PaginatedCommentsResponse {
    data: Comment[];
    links: { // ★ オブジェクト型に ★
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
    meta: { // ★ meta を追加 ★
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

// ユーザープロフィールの型定義 (変更なし)
export interface UserProfile {
    id: number;
    name: string;
    email?: string;
    created_at: string;
    updated_at: string;
    // UserProfilePage で使っているプロパティも必要であれば追加
    followings_count?: number;
    followers_count?: number;
    is_followed_by_user?: boolean;
}