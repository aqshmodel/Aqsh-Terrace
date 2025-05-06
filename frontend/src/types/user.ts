// src/types/user.ts (または src/types/profile.ts)

import type { Post } from './post'; // 投稿の型定義をインポート

// --- API Resource の形式に合わせた型定義 ---

// Experience (職務経歴)
export interface Experience {
  id: number;
  company_name: string;
  position: string;
  start_date: string | null; // YYYY-MM
  end_date: string | null;   // YYYY-MM
  industry: string | null;
  industry_label: string | null;
  company_size: string | null;
  company_size_label: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Education (学歴)
export interface Education {
  id: number;
  school_name: string;
  major: string | null;
  start_date: string | null; // YYYY-MM
  end_date: string | null;   // YYYY-MM
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Skill (スキル) - SkillResource の形式
export interface UserSkill {
  id: number; // スキルマスタの ID
  name: string;
  type: string;
  type_label: string;
  category: string | null;
  user_details: { // 中間テーブルの情報
    level: number | null;
    level_label: string | null;
    years_of_experience: number | null;
    description: string | null;
  } | null; // pivot がロードされていない場合も考慮
}

// PortfolioItem (ポートフォリオ)
export interface PortfolioItem {
  id: number;
  title: string;
  url: string | null;
  description: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

// UserProfile (UserResource の形式)
export interface UserProfile {
  id: number;
  name: string;
  email?: string; // 本人の場合のみ
  profile_image_url: string | null;
  headline: string | null;
  location: string | null;
  introduction: string | null;
  contact_email?: string; // 本人の場合のみ
  social_links: Record<string, string>; // { github: "url", ... }
  experienced_industries: string[]; // ["it_communication", ...]
  experienced_company_types: string[]; // ["startup", ...]
  created_at: string;
  updated_at: string;

  // リレーションデータ (ロードされている場合)
  experiences: Experience[];
  educations: Education[];
  skills: UserSkill[];
  portfolio_items: PortfolioItem[];

  // 追加情報
  is_following?: boolean; // ログイン時に取得
  followers_count?: number;
  followings_count?: number;
  posts_count?: number;

  // メタ情報
  is_owner: boolean; // 本人かどうかのフラグ
}

// ユーザー投稿一覧 API のレスポンス型 (post.ts から移動または再定義)
export interface PaginatedUserPostsResponse {
  data: Post[];
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