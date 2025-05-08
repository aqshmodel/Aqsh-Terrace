// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useAuthStore from "@/stores/authStore"; // AuthState もインポート (またはストアファイルで型が適切にエクスポートされていることを確認)
import useDocumentTitle from '@/hooks/useDocumentTitle';

// shadcn/ui components
import {
  Card,
  CardContent,
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
  PlusCircle, MessageSquare, User, Rss, BarChart3, Briefcase, Users, Bell, Edit3, ThumbsUp, Tags, ExternalLink, LogIn, UserPlus
} from 'lucide-react';

// TanStack Query for data fetching
import { useQuery } from '@tanstack/react-query';

// Define common types (ideally in a types.ts file)
interface Author {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface PostSummary {
  id: string;
  title?: string;
  body: string;
  author: Author;
  createdAt: string;
  commentsCount: number;
  likesCount?: number;
  tags?: string[];
  type?: 'general' | 'business_matching';
}

interface MyActivity {
  recentPosts: { id: string; title: string; createdAt: string }[];
  unreadNotifications: number;
  profileCompletion: number;
}

interface HotTopic {
  name: string;
  count: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
}

// --- Dummy API functions (replace with actual API calls) ---

const fetchMyActivitySummary = async (): Promise<MyActivity> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    recentPosts: [
      { id: 'my-post-1', title: '私の最初のプロジェクト提案', createdAt: '昨日' },
      { id: 'my-post-2', title: '週末の技術勉強会について', createdAt: '3日前' },
    ],
    unreadNotifications: 5,
    profileCompletion: 75,
  };
};

const fetchRecentPosts = async (limit = 5): Promise<PostSummary[]> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const posts: PostSummary[] = [
    { id: 'post-1', body: '新しいWebアプリのアイデアを共有します。フィードバック募集中！', author: { id: 'user1', name: '田中 圭', avatarUrl: 'https://github.com/shadcn.png' }, createdAt: '2時間前', commentsCount: 3, likesCount: 15, tags: ['アイデア', 'Webアプリ'], type: 'general' as 'general' },
    { id: 'post-2', body: '【急募】Reactエンジニアを募集しています。フルリモート可。詳細はDMにて。', author: { id: 'user2', name: '株式会社NextStep', avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4' }, createdAt: '5時間前', commentsCount: 8, likesCount: 22, tags: ['求人', 'React'], type: 'business_matching' as 'business_matching' },
    { id: 'post-3', body: 'Tailwind CSSの便利な使い方を発見しました！ #TailwindCSS', author: { id: 'user3', name: '鈴木 一郎' }, createdAt: '昨日', commentsCount: 1, likesCount: 9, tags: ['TailwindCSS'], type: 'general' as 'general'},
  ];
  return posts.slice(0, limit);
};

const fetchBusinessPosts = async (limit = 3): Promise<PostSummary[]> => {
    const allPosts = await fetchRecentPosts(10);
    return allPosts.filter(p => p.type === 'business_matching').slice(0, limit);
}

const fetchPopularPosts = async (limit = 3): Promise<PostSummary[]> => {
  await new Promise(resolve => setTimeout(resolve, 900));
  const posts: PostSummary[] = [
    { id: 'post-pop-1', body: 'Laravel + React SPA構成のベストプラクティスについて語りましょう。', author: { id: 'user4', name: '佐藤 次郎' }, createdAt: '3日前', commentsCount: 25, likesCount: 78, tags: ['Laravel', 'React'], type: 'general' as 'general' },
    { id: 'post-2', body: '【急募】Reactエンジニアを募集しています。フルリモート可。詳細はDMにて。', author: { id: 'user2', name: '株式会社NextStep', avatarUrl: 'https://avatars.githubusercontent.com/u/124599?v=4' }, createdAt: '5時間前', commentsCount: 8, likesCount: 22, tags: ['求人', 'React'], type: 'business_matching' as 'business_matching' },
  ];
  return posts.slice(0, limit);
};

const fetchHotTopics = async (limit = 6): Promise<HotTopic[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return [
    { name: 'React', count: 150 }, { name: 'TypeScript', count: 120 }, { name: 'Laravel', count: 100 },
    { name: 'キャリア相談', count: 80 }, { name: '新規事業', count: 75 }, { name: 'UIUX', count: 60 },
  ].slice(0, limit);
};

const fetchAnnouncements = async (limit = 2): Promise<Announcement[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return [
    { id: 'anno-1', title: 'Aqsh Terrace v1.0 正式リリース！', content: '長らくお待たせしました！本日、本プラットフォームのv1.0を正式にリリースいたしました。', date: '2025-05-04' },
    { id: 'anno-2', title: '5月10日 システムメンテナンスのお知らせ', content: '午前2時より約2時間のシステムメンテナンスを実施します。ご不便をおかけします。', date: '2025-05-02' },
  ].slice(0, limit);
};

// --- Reusable Components (could be in their own files) ---

const PostSummaryCard: React.FC<{ post: PostSummary }> = ({ post }) => (
  <div className="py-3 first:pt-0 last:pb-0">
    <div className="flex items-start space-x-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
        <AvatarFallback>{post.author.name.substring(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">
            <Link to={`/users/${post.author.id}`} className="hover:underline">{post.author.name}</Link>
          </h4>
          <p className="text-xs text-muted-foreground">{post.createdAt}</p>
        </div>
        <Link to={`/posts/${post.id}`} className="hover:underline">
          <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
        </Link>
        <div className="flex items-center pt-1 text-xs space-x-3">
          {post.likesCount !== undefined && <span className="flex items-center text-muted-foreground"><ThumbsUp className="w-3.5 h-3.5 mr-1" /> {post.likesCount}</span>}
          <span className="flex items-center text-muted-foreground"><MessageSquare className="w-3.5 h-3.5 mr-1" /> {post.commentsCount}</span>
          {post.type === 'business_matching' && <Badge variant="outline" className="text-blue-600 border-blue-600"><Briefcase className="w-3 h-3 mr-1" />案件</Badge>}
        </div>
      </div>
    </div>
  </div>
);

const SectionSkeleton: React.FC<{ itemCount?: number, hasAvatar?: boolean }> = ({ itemCount = 3, hasAvatar = false }) => (
  <div className="space-y-4">
    {Array.from({ length: itemCount }).map((_, i) => (
      <div key={i} className={`flex space-x-3 ${hasAvatar ? 'items-start' : 'items-center'}`}>
        {hasAvatar && <Skeleton className="h-9 w-9 rounded-full" />}
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
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

  const { data: myActivity, isLoading: isLoadingMyActivity } = useQuery<MyActivity>({
    queryKey: ['myActivitySummary', currentUser?.id], // currentUserがnullの場合も考慮
    queryFn: fetchMyActivitySummary,
    enabled: isLoggedIn && !!currentUser?.id,
  });

  const { data: recentPosts, isLoading: isLoadingRecentPosts } = useQuery<PostSummary[]>({
    queryKey: ['recentPostsDashboard'],
    queryFn: () => fetchRecentPosts(5),
  });

  const { data: businessPosts, isLoading: isLoadingBusinessPosts } = useQuery<PostSummary[]>({
    queryKey: ['businessPostsDashboard'],
    queryFn: () => fetchBusinessPosts(3),
  });

  const { data: popularPosts, isLoading: isLoadingPopularPosts } = useQuery<PostSummary[]>({
    queryKey: ['popularPostsDashboard'],
    queryFn: () => fetchPopularPosts(3),
  });

  const { data: hotTopics, isLoading: isLoadingHotTopics } = useQuery<HotTopic[]>({
    queryKey: ['hotTopicsDashboard'],
    queryFn: () => fetchHotTopics(6),
  });

  const { data: announcements, isLoading: isLoadingAnnouncements } = useQuery<Announcement[]>({
    queryKey: ['announcementsDashboard'],
    queryFn: () => fetchAnnouncements(2),
  });

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          {isLoggedIn && currentUser ? (
            <p className="text-muted-foreground">こんにちは、{currentUser.name}さん！今日の活動を始めましょう。</p>
          ) : (
            <p className="text-muted-foreground">Aqsh Terraceへようこそ！様々な情報や機会を見つけましょう。</p>
          )}
        </div>
        {isLoggedIn ? (
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/posts/new">
              <PlusCircle className="mr-2 h-5 w-5" /> 新規投稿
            </Link>
          </Button>
        ) : (
          <div className="flex gap-2 w-full sm:w-auto">
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
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Column 1 */}
        <div className="space-y-6 md:col-span-2 lg:col-span-1">
          {isLoggedIn && currentUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg"><User className="mr-2 h-5 w-5 text-primary" />マイアクティビティ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingMyActivity ? <SectionSkeleton itemCount={3} /> : myActivity ? (
                  <>
                    <div>
                      <h4 className="text-sm font-medium mb-1">最近のあなたの投稿</h4>
                      {myActivity.recentPosts.length > 0 ? (
                        <ul className="space-y-1">
                          {myActivity.recentPosts.map(post => (
                            <li key={post.id} className="text-sm">
                              <Link to={`/posts/${post.id}`} className="text-primary hover:underline line-clamp-1">{post.title}</Link>
                              <span className="text-xs text-muted-foreground ml-1">({post.createdAt})</span>
                            </li>
                          ))}
                        </ul>
                      ) : <p className="text-sm text-muted-foreground">最近の投稿はありません。</p>}
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">未読の通知</span>
                      <Badge variant={myActivity.unreadNotifications > 0 ? "destructive" : "secondary"}>
                        <Bell className="mr-1 h-3 w-3"/>{myActivity.unreadNotifications}件
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">プロフィール完成度</span>
                        <span className="text-sm font-semibold text-primary">{myActivity.profileCompletion}%</span>
                      </div>
                      <Progress value={myActivity.profileCompletion} className="h-2" />
                      {myActivity.profileCompletion < 100 && (
                        <Link to="/profile/edit" className="text-xs text-primary hover:underline flex items-center mt-1.5">
                          <Edit3 className="w-3 h-3 mr-1"/> プロフィールを更新する
                        </Link>
                      )}
                    </div>
                  </>
                ) : <p className="text-sm text-muted-foreground">情報を読み込めませんでした。</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Rss className="mr-2 h-5 w-5 text-primary" />最新の投稿</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {isLoadingRecentPosts ? <SectionSkeleton itemCount={4} hasAvatar /> : recentPosts && recentPosts.length > 0 ? (
                recentPosts.map(post => <PostSummaryCard key={post.id} post={post} />)
              ) : <p className="text-sm text-muted-foreground py-4 text-center">現在、投稿はありません。</p>}
            </CardContent>
            {recentPosts && recentPosts.length > 0 && (
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/posts">全ての投稿を見る <ExternalLink className="w-3.5 h-3.5 ml-1.5"/></Link>
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        {/* Column 2 */}
        <div className="space-y-6">
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
                    <Button variant="outline" size="sm" asChild className="w-full">
                        <Link to="/posts?type=business_matching">全ての案件を見る <ExternalLink className="w-3.5 h-3.5 ml-1.5"/></Link>
                    </Button>
                </CardFooter>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><BarChart3 className="mr-2 h-5 w-5 text-primary" />人気の投稿</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {isLoadingPopularPosts ? <SectionSkeleton itemCount={3} hasAvatar /> : popularPosts && popularPosts.length > 0 ? (
                popularPosts.map(post => <PostSummaryCard key={post.id} post={post} />)
              ) : <p className="text-sm text-muted-foreground py-4 text-center">現在、人気の投稿はありません。</p>}
            </CardContent>
          </Card>
        </div>

        {/* Column 3 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Bell className="mr-2 h-5 w-5 text-primary" />運営からのお知らせ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingAnnouncements ? <SectionSkeleton itemCount={2}/> : announcements && announcements.length > 0 ? (
                announcements.map(anno => (
                  <div key={anno.id} className="text-sm">
                    <h4 className="font-semibold mb-0.5 line-clamp-1">{anno.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">{anno.content}</p>
                    <p className="text-xs text-muted-foreground/80 mt-0.5">{anno.date}</p>
                  </div>
                ))
              ) : <p className="text-sm text-muted-foreground">現在お知らせはありません。</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Tags className="mr-2 h-5 w-5 text-primary" />注目トピック</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {isLoadingHotTopics ? Array.from({length:6}).map((_,i) => <Skeleton key={i} className="h-6 w-20 rounded-md" />) : hotTopics && hotTopics.length > 0 ? (
                hotTopics.map(topic => (
                  <Button key={topic.name} variant="outline" size="sm" asChild className="rounded-full text-xs">
                    <Link to={`/topics/${encodeURIComponent(topic.name)}`}>
                      #{topic.name} <span className="ml-1 opacity-70">({topic.count})</span>
                    </Link>
                  </Button>
                ))
              ) : <p className="text-sm text-muted-foreground">現在注目のトピックはありません。</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Users className="mr-2 h-5 w-5 text-primary" />おすすめユーザー/企業</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Placeholder: Replace with actual data and logic */}
              <SectionSkeleton itemCount={2} hasAvatar />
              <p className="text-xs text-muted-foreground text-center pt-1">
                <Link to="/explore/users" className="hover:underline">もっと探す...</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default HomePage;