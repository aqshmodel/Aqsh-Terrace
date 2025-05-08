// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useAuthStore from "@/stores/authStore";
// ★ AuthState をインポート (ストアの型定義ファイルから)
import useDocumentTitle from '@/hooks/useDocumentTitle';

// shadcn/ui components
import {
  Card,
  CardContent,
  // CardDescription, // 未使用のためコメントアウトも検討
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// icons from lucide-react
import {
  PlusCircle, MessageSquare, Rss, Briefcase, Users, Bell, Edit3, ThumbsUp, Tags, ExternalLink, LogIn, UserPlus, Info, Activity, Star,
} from 'lucide-react';

// TanStack Query for data fetching
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from "@/lib/utils"; // ★ cn 関数をインポート

// --- 型定義 ---
interface Author {
  id: string; // バックエンドの User ID (数値かもしれないので注意)
  name: string;
  profile_image_url?: string | null; // バックエンドの User モデルに合わせる
}

interface PostSummary {
  id: number; // バックエンドの Post ID (数値かもしれないので注意)
  title?: string | null;
  body: string;
  user: Author; // ネストされたユーザー情報 (author -> user などAPIに合わせる)
  created_at: string;
  comments_count: number;
  likes_count?: number;
  tags?: Array<{ id: number, name: string }>; // タグもオブジェクト配列の可能性
  type?: 'general' | 'business_matching';
}

interface MyActivitySummary {
  recent_posts: Array<{ id: number; title: string | null; created_at: string }>;
  unread_notifications_count: number;
  profile_completion_percentage: number; // パーセンテージ
}

interface HotTopic {
  id: number; // タグIDなど
  name: string;
  posts_count: number; // 投稿数
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  published_at: string; // created_at や date など API に合わせる
  link_url?: string | null; // お知らせへの詳細リンク (任意)
}

// --- API 関数 ---
const fetchMyActivitySummary = async (): Promise<MyActivitySummary> => {
  const response = await apiClient.get<{ data: MyActivitySummary }>('/api/dashboard/my-activity');
  if (!response.data.data) throw new Error('Failed to fetch my activity summary');
  return response.data.data;
};

const fetchRecentPosts = async (limit = 5): Promise<PostSummary[]> => {
  const response = await apiClient.get<{ data: PostSummary[] }>(`/api/dashboard/recent-posts?limit=${limit}`);
  if (!response.data.data) throw new Error('Failed to fetch recent posts');
  return response.data.data;
};

const fetchBusinessMatchingPosts = async (limit = 3): Promise<PostSummary[]> => {
  const response = await apiClient.get<{ data: PostSummary[] }>(`/api/dashboard/business-posts?limit=${limit}`);
   if (!response.data.data) throw new Error('Failed to fetch business posts');
  return response.data.data;
};

const fetchPopularPosts = async (limit = 3): Promise<PostSummary[]> => {
  const response = await apiClient.get<{ data: PostSummary[] }>(`/api/dashboard/popular-posts?limit=${limit}`);
  if (!response.data.data) throw new Error('Failed to fetch popular posts');
  return response.data.data;
};

const fetchHotTopics = async (limit = 6): Promise<HotTopic[]> => {
  const response = await apiClient.get<{ data: HotTopic[] }>(`/api/dashboard/hot-topics?limit=${limit}`);
  if (!response.data.data) throw new Error('Failed to fetch hot topics');
  return response.data.data;
};

const fetchAnnouncements = async (limit = 2): Promise<Announcement[]> => {
  const response = await apiClient.get<{ data: Announcement[] }>(`/api/dashboard/announcements?limit=${limit}`);
  if (!response.data.data) throw new Error('Failed to fetch announcements');
  return response.data.data;
};

// --- 再利用可能なコンポーネント ---

const PostSummaryCard: React.FC<{ post: PostSummary }> = ({ post }) => (
  <div className="py-4 first:pt-0 last:pb-0">
    <div className="flex items-start space-x-3">
      <Link to={`/users/${post.user.id}`}>
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.user.profile_image_url ?? undefined} alt={post.user.name} />
          <AvatarFallback>{post.user.name.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            <Link to={`/users/${post.user.id}`} className="hover:underline">{post.user.name}</Link>
          </h4>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
        </div>
        <Link to={`/posts/${post.id}`} className="block group">
          {post.title && <h5 className="text-sm font-medium mb-0.5 group-hover:text-primary transition-colors line-clamp-1">{post.title}</h5>}
          <p className={`text-sm ${post.title ? 'text-muted-foreground' : 'text-foreground'} group-hover:text-primary/80 transition-colors line-clamp-2`}>
            {post.body}
          </p>
        </Link>
        <div className="flex items-center pt-1.5 text-xs space-x-3 flex-wrap gap-y-1">
          {post.likes_count !== undefined && <span className="flex items-center text-muted-foreground"><ThumbsUp className="w-3.5 h-3.5 mr-1" /> {post.likes_count}</span>}
          <span className="flex items-center text-muted-foreground"><MessageSquare className="w-3.5 h-3.5 mr-1" /> {post.comments_count}</span>
          {post.type === 'business_matching' &&
            <Badge variant="outline" className="text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500 text-xs">
                <Briefcase className="w-3 h-3 mr-1" />案件
            </Badge>
          }
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 2).map(tag => <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>)}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const SectionSkeleton: React.FC<{ itemCount?: number, hasAvatar?: boolean, className?: string }> = ({ itemCount = 3, hasAvatar = false, className }) => (
  <div className={cn("space-y-4", className)}>
    {Array.from({ length: itemCount }).map((_, i) => (
      <div key={i} className={`flex space-x-3 ${hasAvatar ? 'items-start' : 'items-center'}`}>
        {hasAvatar && <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          {hasAvatar && <Skeleton className="h-3 w-1/4" />}
        </div>
      </div>
    ))}
  </div>
);

// --- HomePage Component ---

function HomePage() {
  useDocumentTitle('Aqsh Terrace | ダッシュボード');
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
const currentUser = useAuthStore((state) => state.user);

  const { data: myActivity, isLoading: isLoadingMyActivity } = useQuery<MyActivitySummary, Error>({
    queryKey: ['dashboardMyActivity', currentUser?.id], // user を使用
    queryFn: fetchMyActivitySummary,
    enabled: isLoggedIn && !!currentUser?.id, // user を使用
    staleTime: 1000 * 60 * 5, // 5分
  });

  const { data: recentPosts, isLoading: isLoadingRecentPosts } = useQuery<PostSummary[], Error>({
    queryKey: ['dashboardRecentPosts'],
    queryFn: () => fetchRecentPosts(5),
    staleTime: 1000 * 60 * 2, // 2分
  });

  const { data: businessPosts, isLoading: isLoadingBusinessPosts } = useQuery<PostSummary[], Error>({
    queryKey: ['dashboardBusinessPosts'],
    queryFn: () => fetchBusinessMatchingPosts(3),
    staleTime: 1000 * 60 * 5,
  });

  const { data: popularPosts, isLoading: isLoadingPopularPosts } = useQuery<PostSummary[], Error>({
    queryKey: ['dashboardPopularPosts'],
    queryFn: () => fetchPopularPosts(3),
    staleTime: 1000 * 60 * 10, // 10分
  });

  const { data: hotTopics, isLoading: isLoadingHotTopics } = useQuery<HotTopic[], Error>({
    queryKey: ['dashboardHotTopics'],
    queryFn: () => fetchHotTopics(7), // 表示数変更
    staleTime: 1000 * 60 * 30, // 30分
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<Announcement[], Error>({
    queryKey: ['dashboardAnnouncements'],
    queryFn: () => fetchAnnouncements(2),
    staleTime: 1000 * 60 * 60, // 1時間
  });

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">ダッシュボード</h1>
          {isLoggedIn && currentUser ? (
            <p className="text-muted-foreground text-base md:text-lg mt-1">こんにちは、{currentUser.name}さん！今日の活動を始めましょう。</p>
          ) : (
            <p className="text-muted-foreground text-base md:text-lg mt-1">Aqsh Terraceへようこそ！様々な情報や機会を見つけましょう。</p>
          )}
        </div>
        {isLoggedIn ? (
          <Button asChild size="lg" className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
            <Link to="/posts/new">
              <PlusCircle className="mr-2 h-5 w-5" /> 新規投稿
            </Link>
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button asChild variant="outline" className="flex-1 sm:flex-none">
              <Link to="/login"><LogIn className="mr-2 h-4 w-4" />ログイン</Link>
            </Button>
            <Button asChild className="flex-1 sm:flex-none">
              <Link to="/register"><UserPlus className="mr-2 h-4 w-4" />新規登録</Link>
            </Button>
          </div>
        )}
      </header>

      <Separator />

      {/* Main Content Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* --- Column 1 (Main Feed & My Activity) --- */}
        <div className="lg:col-span-2 space-y-6">
          {isLoggedIn && currentUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl"><Activity className="mr-2 h-5 w-5 text-primary" />マイアクティビティ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingMyActivity ? <SectionSkeleton itemCount={3} /> : myActivity ? (
                  <>
                    <div>
                      <h4 className="text-base font-medium mb-2">最近のあなたの投稿</h4>
                      {myActivity.recent_posts.length > 0 ? (
                        <ul className="space-y-1.5">
                          {myActivity.recent_posts.map(post => (
                            <li key={post.id} className="text-sm">
                              <Link to={`/posts/${post.id}`} className="text-primary hover:underline line-clamp-1 font-medium">{post.title || "無題の投稿"}</Link>
                              <span className="text-xs text-muted-foreground ml-1.5">({formatRelativeTime(post.created_at)})</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">最近の投稿はありません。</p>}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <Link to="/notifications" className="text-base font-medium flex items-center hover:text-primary transition-colors">
                        <Bell className="mr-1.5 h-4 w-4"/>未読の通知
                      </Link>
                      <Badge variant={myActivity.unread_notifications_count > 0 ? "destructive" : "outline"} className="text-sm px-2.5 py-1">
                        {myActivity.unread_notifications_count}件
                      </Badge>
                    </div>
                    <Separator />
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-base font-medium">プロフィール完成度</span>
                        <span className="text-base font-semibold text-primary">{myActivity.profile_completion_percentage}%</span>
                      </div>
                      <Progress value={myActivity.profile_completion_percentage} className="h-2.5" />
                      {myActivity.profile_completion_percentage < 100 && (
                        <Link to="/profile/edit" className="text-xs text-primary hover:underline flex items-center mt-2 group">
                          <Edit3 className="w-3 h-3 mr-1 group-hover:animate-pulse"/> プロフィールを充実させる
                        </Link>
                      )}
                    </div>
                  </>
                ) : <p className="text-sm text-muted-foreground">マイアクティビティ情報を読み込めませんでした。</p>}
              </CardContent>
            </Card>
          )}

          {isLoggedIn && (
             <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5 text-primary" />
                    新しい投稿を作成
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-muted-foreground italic">(投稿フォームはここに表示されます)</p>
                   {/* Example: <Button onClick={() => navigate("/posts/new")}>投稿ページへ</Button> */}
                </CardContent>
              </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl"><Rss className="mr-2 h-5 w-5 text-primary" />最新の投稿</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {isLoadingRecentPosts ? <SectionSkeleton itemCount={5} hasAvatar /> : recentPosts && recentPosts.length > 0 ? (
                recentPosts.map(post => <PostSummaryCard key={post.id} post={post} />)
              ) : <p className="text-sm text-muted-foreground py-4 text-center">現在、投稿はありません。</p>}
            </CardContent>
            {recentPosts && recentPosts.length > 0 && (
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full hover:bg-accent transition-colors">
                  <Link to="/posts">全ての投稿を見る <ExternalLink className="w-3.5 h-3.5 ml-1.5"/></Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* --- Column 2 (Side Content) --- */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Briefcase className="mr-2 h-5 w-5 text-primary" />注目のビジネス案件</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {isLoadingBusinessPosts ? <SectionSkeleton itemCount={3} hasAvatar /> : businessPosts && businessPosts.length > 0 ? (
                businessPosts.map(post => <PostSummaryCard key={post.id} post={post} />)
              ) : <p className="text-sm text-muted-foreground py-4 text-center">現在、注目の案件はありません。</p>}
            </CardContent>
            {businessPosts && businessPosts.length > 0 && (
                <CardFooter>
                    <Button variant="outline" size="sm" asChild className="w-full hover:bg-accent transition-colors">
                        <Link to="/posts?type=business_matching">全ての案件を見る <ExternalLink className="w-3.5 h-3.5 ml-1.5"/></Link>
                    </Button>
                </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Star className="mr-2 h-5 w-5 text-primary" />人気の投稿</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {isLoadingPopularPosts ? <SectionSkeleton itemCount={3} hasAvatar /> : popularPosts && popularPosts.length > 0 ? (
                popularPosts.map(post => <PostSummaryCard key={post.id} post={post} />)
              ) : <p className="text-sm text-muted-foreground py-4 text-center">現在、人気の投稿はありません。</p>}
            </CardContent>
            {/* 人気の投稿セクションには通常「もっと見る」は少ないですが、必要なら追加 */}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Info className="mr-2 h-5 w-5 text-primary" />運営からのお知らせ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingAnnouncements ? <SectionSkeleton itemCount={2}/> : announcements && announcements.length > 0 ? (
                announcements.map(anno => (
                  <div key={anno.id} className="text-sm pb-2 border-b border-dashed last:border-b-0 last:pb-0">
                    <Link to={anno.link_url || `/announcements/${anno.id}`} className="font-semibold mb-0.5 line-clamp-1 hover:text-primary transition-colors block">{anno.title}</Link>
                    <p className="text-xs text-muted-foreground line-clamp-2">{anno.content}</p>
                    <p className="text-xs text-muted-foreground/80 mt-1">{formatRelativeTime(anno.published_at)}</p>
                  </div>
                ))
              ) : <p className="text-sm text-muted-foreground">現在お知らせはありません。</p>}
            </CardContent>
             {announcements && announcements.length > 0 && (
                 <CardFooter>
                    <Button variant="ghost" size="sm" asChild className="w-full text-primary hover:bg-primary/10">
                        <Link to="/announcements">全てのお知らせを見る</Link>
                    </Button>
                 </CardFooter>
             )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Tags className="mr-2 h-5 w-5 text-primary" />注目トピック</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isLoadingHotTopics ? Array.from({length:7}).map((_,i) => <Skeleton key={i} className="h-7 w-24 rounded-full" />) : hotTopics && hotTopics.length > 0 ? (
                hotTopics.map(topic => (
                  <Button key={topic.id} variant="outline" size="sm" asChild className="rounded-full text-xs hover:border-primary hover:text-primary transition-colors">
                    <Link to={`/topics/${topic.id}`}>
                      #{topic.name} <span className="ml-1.5 opacity-70">({topic.posts_count})</span>
                    </Link>
                  </Button>
                ))
              ) : <p className="text-sm text-muted-foreground">現在注目のトピックはありません。</p>}
            </CardContent>
            {/* 注目トピックセクションには通常「もっと見る」は少ないですが、必要なら追加 */}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-primary" />おすすめユーザー/企業</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SectionSkeleton itemCount={2} hasAvatar />
              <p className="text-xs text-muted-foreground text-center pt-1">
                <Link to="/explore/users" className="hover:underline text-primary">もっと探す...</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default HomePage;