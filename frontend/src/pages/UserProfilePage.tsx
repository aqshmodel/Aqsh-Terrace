// frontend/src/pages/UserProfilePage.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import {
    UserProfile,
    PaginatedUserPostsResponse,
    UserSkill,
    // Experience, Education, PortfolioItem はここでは直接使わないが、UserProfile 型内で参照されている
} from '@/types/user'; // 型定義をインポート
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // 未使用
// import { Dialog, DialogTrigger } from "@/components/ui/dialog"; // 未使用
// import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // 未使用
import {
    ExternalLink, MapPin, Mail, Edit, Loader2, Github, Twitter, Linkedin, Facebook, Instagram, // ★ Facebook, Instagram 追加
    Building, GraduationCap, UserCheck, UserPlus, Briefcase, Lightbulb, BookOpen, Star,
    Calendar, MessageSquare, Terminal, MoreHorizontal, User as UserIcon,
    Link as LinkIcon // ★ LinkIcon 追加 (会社URL用)
    // ChevronDown, ChevronUp // 未使用
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { PostList } from '@/components/PostList'; // 名前付きインポート
import useAuthStore from '@/stores/authStore';
import { useState, useEffect, useCallback } from 'react'; // useCallback をインポート
import useDocumentTitle from '@/hooks/useDocumentTitle'; // ★ カスタムフックをインポート
// import { Helmet } from 'react-helmet-async'; // 未使用
// import { PostEditDialog } from '@/components/PostEditDialog'; // 未使用
// import { PostDeleteAlert } from '@/components/PostDeleteAlert'; // 未使用
// import type { Post as PostType } from '@/types/post'; // 未使用

// --- API 関数 ---
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<{ data: UserProfile }>(`/api/users/${userId}`);
    // データ存在チェックを修正 (response.data が存在し、その中の data プロパティが存在するか)
    if (!response.data || !response.data.data) { throw new Error('User data not found in response'); }
    return response.data.data;
};

const fetchUserPosts = async (userId: string, page = 1): Promise<PaginatedUserPostsResponse> => {
    const response = await apiClient.get<PaginatedUserPostsResponse>(`/api/users/${userId}/posts?page=${page}`);
    return response.data;
};

const followUser = async (userId: number) => {
    await apiClient.post(`/api/users/${userId}/follow`);
};

const unfollowUser = async (userId: number) => {
    await apiClient.delete(`/api/users/${userId}/follow`);
};

// メタデータ取得API (プロフィール表示用)
interface Metadata {
    industries: Record<string, string>;
    company_types: Record<string, string>;
    company_sizes: Record<string, string>;
    skill_types: Record<string, string>;
    skill_levels: Record<string, string>;
}
const fetchMetadata = async (): Promise<Metadata> => {
    const response = await apiClient.get<Metadata>('/api/metadata');
    return response.data;
}

// --- コンポーネント本体 ---
function UserProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: loggedInUser, isLoggedIn } = useAuthStore();
    const [postPage, setPostPage] = useState(1);

    // メタデータの取得
    const { data: metadata } = useQuery<Metadata, Error>({
        queryKey: ['metadata'],
        queryFn: fetchMetadata,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    // userId が URL に存在しない場合
    if (!userId) {
        navigate('/404');
        return null;
    }
    const parsedUserId = parseInt(userId, 10);

    // ユーザープロフィールの取得
    const { data: profile, isLoading, error } = useQuery<UserProfile, Error>({
        queryKey: ['user', userId],
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    // ★ データ取得後にタイトルを設定
    useDocumentTitle(profile?.name ? `Aqsh Terrace | ${profile.name}さん` : 'Aqsh Terrace | ユーザープロフィール');

    // ユーザー投稿リストのクエリキー
    const userPostsQueryKey = ['userPosts', userId, postPage];

    // ユーザー投稿リストの取得
    const { data: postsData, isLoading: isLoadingPosts, isFetching: isFetchingPosts, isError: isErrorPosts, error: errorPosts } = useQuery<PaginatedUserPostsResponse, Error>({
        queryKey: userPostsQueryKey,
        queryFn: () => fetchUserPosts(userId, postPage),
        enabled: !!userId,
        placeholderData: keepPreviousData,
        staleTime: 1 * 60 * 1000,
    });

    // フォロー処理の Mutation
    const followMutation = useMutation<void, Error, void, unknown>({
        mutationFn: () => followUser(parsedUserId),
        onSuccess: () => {
            queryClient.setQueryData<UserProfile>(['user', userId], (oldData) => {
                if (!oldData) return oldData;
                return { ...oldData, is_following: true, followers_count: (oldData.followers_count ?? 0) + 1 };
            });
            // フォロー/フォロワーリスト関連のキャッシュを無効化
            queryClient.invalidateQueries({ queryKey: ['followers', userId] });
            queryClient.invalidateQueries({ queryKey: ['followings', loggedInUser?.id] });
        },
        onError: (err) => {
            console.error("フォローエラー:", err);
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        }
    });

    // アンフォロー処理の Mutation
    const unfollowMutation = useMutation<void, Error, void, unknown>({
        mutationFn: () => unfollowUser(parsedUserId),
        onSuccess: () => {
             queryClient.setQueryData<UserProfile>(['user', userId], (oldData) => {
                if (!oldData) return oldData;
                return { ...oldData, is_following: false, followers_count: Math.max(0, (oldData.followers_count ?? 0) - 1) };
            });
            // フォロー/フォロワーリスト関連のキャッシュを無効化
            queryClient.invalidateQueries({ queryKey: ['followers', userId] });
            queryClient.invalidateQueries({ queryKey: ['followings', loggedInUser?.id] });
        },
        onError: (err) => {
            console.error("アンフォローエラー:", err);
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        }
    });

    // いいね成功時のコールバック
    const handleLikeToggleSuccess = useCallback((postId: number, newLikedStatus: boolean, newLikesCount: number) => {
        // console.log(`[UserProfilePage] Received like success for post ${postId}. Updating cache...`);
        queryClient.setQueryData<PaginatedUserPostsResponse>(userPostsQueryKey, (oldData) => {
            if (!oldData) return oldData;
            const newData = oldData.data.map(post => {
                if (post.id === postId) {
                    return { ...post, liked_by_user: newLikedStatus, likes_count: newLikesCount };
                }
                return post;
            });
            return { ...oldData, data: newData };
        });
    }, [queryClient, userPostsQueryKey]);

    // いいね失敗時のコールバック
    const handleLikeToggleError = useCallback((error: Error, postId: number) => {
        console.error(`[UserProfilePage] Received like error for post ${postId}:`, error);
        queryClient.invalidateQueries({ queryKey: ['userPosts', userId] });
    }, [queryClient, userId]);

    // --- ローディング・エラー表示 (プロファイル取得) ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    if (error || !profile) {
        const errorStatus = (error as any)?.response?.status;
        const errorMessage = error?.message || 'ユーザー情報の取得に失敗しました。';
        const errorTitle = errorStatus === 404 ? 'ユーザーが見つかりません' : 'エラー';
        return (
            <Alert variant="destructive" className="my-4 max-w-3xl">
                <Terminal className="h-4 w-4" />
                <AlertTitle>{errorTitle}</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
                <Button variant="link" onClick={() => navigate('/')} className="mt-2">ホームに戻る</Button>
            </Alert>
        );
    }

    // --- レンダリング補助関数 ---
    const isOwner = profile.is_owner;

    // ★ ソーシャルリンク表示関数を更新
    const renderSocialLinks = () => {
         // social_links が null or undefined or 空オブジェクトの場合
         if (!profile.social_links || Object.keys(profile.social_links).length === 0) return null;

         const links = [];
         // 各キーが存在し、かつURLが空でない場合のみリンクを追加
         if (profile.social_links?.github) links.push({ icon: Github, url: profile.social_links.github, label: 'GitHub' });
         if (profile.social_links?.twitter) links.push({ icon: Twitter, url: profile.social_links.twitter, label: 'Twitter/X' });
         if (profile.social_links?.linkedin) links.push({ icon: Linkedin, url: profile.social_links.linkedin, label: 'LinkedIn' });
         // ★ Facebook と Instagram を追加
         if (profile.social_links?.facebook) links.push({ icon: Facebook, url: profile.social_links.facebook, label: 'Facebook' });
         if (profile.social_links?.instagram) links.push({ icon: Instagram, url: profile.social_links.instagram, label: 'Instagram' });

         if (links.length === 0) return null; // 有効なリンクがない場合は何も表示しない

         return (
             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3"> {/* mt-2からmt-3へ調整 */}
                 {links.map((link) => (
                     <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                         <link.icon className="h-4 w-4 mr-1 flex-shrink-0" /> {/* アイコンサイズ調整 */}
                         {link.label}
                         <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" /> {/* サイズ、マージン調整 */}
                     </a>
                 ))}
             </div>
         );
    };

    // 経験業界などのラベル表示
    const renderLabelsFromArray = (keys: string[] | undefined | null, configKey: keyof Metadata) => {
        if (!keys || keys.length === 0 || !metadata) return null;
        const labelMap = metadata[configKey];
        if (!labelMap) return null;
        return keys.map(key => (
            <Badge key={key} variant="outline" className="mr-1 mb-1 text-xs sm:text-sm">
                {labelMap[key] || key}
            </Badge>
        ));
    };

    // スキル表示 (タイプ別グループ化)
    const groupSkillsByType = (skills: UserSkill[] | undefined | null): Record<string, UserSkill[]> => {
        if (!skills) return {};
        return skills.reduce((acc, skill) => {
            const typeKey = skill.type || 'その他';
            if (!acc[typeKey]) acc[typeKey] = [];
            acc[typeKey].push(skill);
            return acc;
        }, {} as Record<string, UserSkill[]>);
    };
    const groupedSkills = groupSkillsByType(profile.skills);

    // --- JSX レンダリング本体 ---
    return (
        <div className="px-4 py-8">
            {/* --- 上部: 基本情報 & アクションボタン --- */}
            <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
                {/* アバター */}
                <Avatar className="h-50 w-50 md:h-50 md:w-50 border flex-shrink-0">
                    <AvatarImage src={profile.profile_image_url ?? undefined} alt={profile.name} />
                    <AvatarFallback className="text-4xl">{profile.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* 名前、ヘッドライン、基本情報 */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    {profile.headline && <p className="text-lg text-muted-foreground mt-1">{profile.headline}</p>}

                    {/* ★ 所属企業表示を追加 */}
                    {profile.current_company_name && (
                        <div className="flex items-center text-sm text-muted-foreground mt-3">
                            <Building className="h-4 w-4 mr-1.5 flex-shrink-0" />
                            <span>{profile.current_company_name}</span>
                            {profile.current_company_url && (
                                <a href={profile.current_company_url} target="_blank" rel="noopener noreferrer" className="ml-2 flex items-center hover:text-primary hover:underline">
                                    <LinkIcon className="h-3 w-3 mr-0.5" />
                                    <span>Webサイト</span>
                                    <ExternalLink className="h-3 w-3 ml-0.5 opacity-70" />
                                </a>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-3 flex-wrap">
                        {profile.location && <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 flex-shrink-0" /> {profile.location}</span>}
                        <span className="flex items-center"><Calendar className="h-4 w-4 mr-1 flex-shrink-0" /> 登録日: {formatRelativeTime(profile.created_at)}</span>
                    </div>

                    {/* 経験業界・企業タイプ */}
                    {(profile.experienced_industries && profile.experienced_industries.length > 0 ||
                      profile.experienced_company_types && profile.experienced_company_types.length > 0) && (
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mt-3">
                            {profile.experienced_industries && profile.experienced_industries.length > 0 && (
                                <div className="flex items-start"><Briefcase className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" /> <span className="mr-1">経験業界:</span> <div>{renderLabelsFromArray(profile.experienced_industries, 'industries')}</div></div>
                            )}
                            {profile.experienced_company_types && profile.experienced_company_types.length > 0 && (
                                <div className="flex items-start"><Building className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" /> <span className="mr-1">経験企業タイプ:</span> <div>{renderLabelsFromArray(profile.experienced_company_types, 'company_types')}</div></div>
                            )}
                        </div>
                    )}

                    {/* ★ ソーシャルリンク表示関数を呼び出し */}
                    {renderSocialLinks()}
                </div>

                {/* アクションボタン (編集/フォロー/アンフォロー) */}
                <div className="flex gap-2 mt-4 w-full md:w-auto md:mt-0 md:flex-col lg:flex-row flex-shrink-0">
                    {isOwner && (
                        <Button variant="outline" className="w-full md:w-auto" asChild>
                            <Link to="/profile/edit">
                                <Edit className="h-4 w-4 mr-2" /> プロフィール編集
                            </Link>
                        </Button>
                    )}
                    {!isOwner && isLoggedIn && profile.is_following !== undefined && (
                        profile.is_following ? (
                            <Button
                                variant="outline"
                                className="w-full md:w-auto"
                                onClick={() => unfollowMutation.mutate()}
                                disabled={unfollowMutation.isPending || followMutation.isPending}
                            >
                                {unfollowMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserCheck className="mr-2 h-4 w-4" />}
                                フォロー中
                            </Button>
                        ) : (
                            <Button
                                className="w-full md:w-auto"
                                onClick={() => followMutation.mutate()}
                                disabled={followMutation.isPending || unfollowMutation.isPending}
                            >
                                {followMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
                                フォローする
                            </Button>
                        )
                    )}
                    {!isLoggedIn && !isOwner && (
                        <Button disabled className="w-full md:w-auto">
                           <UserPlus className="mr-2 h-4 w-4" /> フォローする (ログインが必要です)
                        </Button>
                    )}
                </div>
            </div>

            {/* --- フォロー/フォロワー数/投稿数 --- */}
            {(profile.followings_count !== undefined || profile.followers_count !== undefined || profile.posts_count !== undefined) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8 text-sm">
                    {profile.followings_count !== undefined && (
                         <Link to={`/users/${userId}/following`} className="hover:underline text-muted-foreground hover:text-primary">
                             <span className="font-semibold text-foreground">{profile.followings_count}</span> フォロー中
                         </Link>
                    )}
                    {profile.followers_count !== undefined && (
                         <Link to={`/users/${userId}/followers`} className="hover:underline text-muted-foreground hover:text-primary">
                             <span className="font-semibold text-foreground">{profile.followers_count}</span> フォロワー
                         </Link>
                    )}
                    {profile.posts_count !== undefined && (
                         <span className="text-muted-foreground">
                             <span className="font-semibold text-foreground">{profile.posts_count}</span> 件の投稿
                         </span>
                     )}
                 </div>
             )}

            {/* --- 詳細情報 (タブ形式) --- */}
            <Tabs defaultValue="introduction" className="w-full">
                {/* タブリスト */}
                <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-4 overflow-x-auto sm:overflow-x-visible">
                    <TabsTrigger value="introduction"><UserIcon className="h-4 w-4 mr-1 sm:hidden" aria-hidden="true" />概要</TabsTrigger>
                    <TabsTrigger value="experience"><Briefcase className="h-4 w-4 mr-1 sm:hidden" aria-hidden="true" />職務経歴</TabsTrigger>
                    <TabsTrigger value="education"><GraduationCap className="h-4 w-4 mr-1 sm:hidden" aria-hidden="true" />学歴</TabsTrigger>
                    <TabsTrigger value="skills"><Lightbulb className="h-4 w-4 mr-1 sm:hidden" aria-hidden="true" />スキル</TabsTrigger>
                    <TabsTrigger value="portfolio"><BookOpen className="h-4 w-4 mr-1 sm:hidden" aria-hidden="true" />ポートフォリオ</TabsTrigger>
                    <TabsTrigger value="posts"><MessageSquare className="h-4 w-4 mr-1 sm:hidden" aria-hidden="true" />投稿</TabsTrigger>
                </TabsList>

                {/* --- 各タブのコンテンツ --- */}
                {/* 概要タブ */}
                <TabsContent value="introduction">
                    <Card>
                        <CardHeader><CardTitle>概要・自己紹介</CardTitle></CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                             {profile.introduction || <p className="text-muted-foreground italic">自己紹介はまだ登録されていません。</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 職務経歴タブ */}
                <TabsContent value="experience">
                    <Card>
                        <CardHeader><CardTitle>職務経歴</CardTitle></CardHeader>
                        <CardContent>
                            {profile.experiences && profile.experiences.length > 0 ? (
                                <ul className="space-y-6">
                                    {profile.experiences.map(exp => (
                                        <li key={exp.id} className="border-l-2 pl-6 border-border relative">
                                            <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1 border-2 border-background"></div>
                                            <p className="font-semibold text-base sm:text-lg">{exp.position} <span className="font-normal text-muted-foreground">@</span> {exp.company_name}</p>
                                            <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                <span className="flex items-center"><Calendar className="inline h-3 w-3 mr-1" />{exp.start_date} ～ {exp.end_date ?? '現在'}</span>
                                                {exp.industry_label && <span className="flex items-center"><Briefcase className="inline h-3 w-3 mr-1" />{exp.industry_label}</span>}
                                                {exp.company_size_label && <span className="flex items-center"><Building className="inline h-3 w-3 mr-1" />{exp.company_size_label}</span>}
                                            </div>
                                            {exp.description && <p className="mt-2 text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{exp.description}</p>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic">職務経歴はまだ登録されていません。</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 学歴タブ */}
                <TabsContent value="education">
                     <Card>
                        <CardHeader><CardTitle>学歴</CardTitle></CardHeader>
                        <CardContent>
                             {profile.educations && profile.educations.length > 0 ? (
                                <ul className="space-y-4">
                                    {profile.educations.map(edu => (
                                        <li key={edu.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                            <p className="font-semibold">{edu.school_name}</p>
                                            {edu.major && <p className="text-sm text-muted-foreground">{edu.major}</p>}
                                            <p className="text-sm text-muted-foreground"><Calendar className="inline h-3 w-3 mr-1" />{edu.start_date} ～ {edu.end_date ?? '卒業'}</p>
                                            {edu.description && <p className="mt-1 text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{edu.description}</p>}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic">学歴はまだ登録されていません。</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* スキルタブ */}
                 <TabsContent value="skills">
                     <Card>
                         <CardHeader><CardTitle>スキル</CardTitle></CardHeader>
                         <CardContent className="space-y-4">
                             {Object.keys(groupedSkills).length > 0 ? (
                                 Object.entries(groupedSkills).map(([type, skills]) => (
                                     <div key={type}>
                                         <h3 className="text-md font-semibold mb-2 text-muted-foreground">{metadata?.skill_types[type] || type}</h3>
                                         <div className="flex flex-wrap gap-2">
                                             {skills.map(skill => (
                                                 <Badge key={skill.id} variant="secondary" className="px-3 py-1 text-sm">
                                                     {skill.name}
                                                     {skill.user_details?.level && (
                                                          <span className="ml-1.5 text-xs opacity-75 flex items-center">
                                                              <Star className="h-3 w-3 mr-0.5 fill-current text-yellow-500"/>
                                                              {metadata?.skill_levels[skill.user_details.level] || skill.user_details.level}
                                                          </span>
                                                     )}
                                                      {skill.user_details?.years_of_experience !== undefined && skill.user_details.years_of_experience !== null && (
                                                          <span className="ml-1.5 text-xs opacity-75">({skill.user_details.years_of_experience}年)</span>
                                                      )}
                                                 </Badge>
                                             ))}
                                         </div>
                                     </div>
                                 ))
                             ) : (
                                 <p className="text-muted-foreground italic">スキルはまだ登録されていません。</p>
                             )}
                         </CardContent>
                     </Card>
                 </TabsContent>

                {/* ポートフォリオタブ */}
                <TabsContent value="portfolio">
                    <Card>
                        <CardHeader><CardTitle>ポートフォリオ</CardTitle></CardHeader>
                        <CardContent>
                             {profile.portfolio_items && profile.portfolio_items.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {profile.portfolio_items.map(item => (
                                        <Card key={item.id} className="overflow-hidden flex flex-col">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base">{item.title}</CardTitle>
                                                 {item.url && (
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center break-all mt-1">
                                                        <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0"/><span>{item.url}</span> <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-70" />
                                                    </a>
                                                 )}
                                            </CardHeader>
                                            {item.description && (
                                                <CardContent className="flex-grow">
                                                    <p className="text-sm prose prose-sm dark:prose-invert max-w-none">{item.description}</p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">ポートフォリオはまだ登録されていません。</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 投稿タブ */}
                <TabsContent value="posts">
                     <h2 className="text-xl font-semibold mb-4">{profile.name}さんの投稿</h2>
                    <PostList
                        postsData={postsData}
                        isLoading={isLoadingPosts && !isFetchingPosts}
                        isFetching={isFetchingPosts}
                        isError={isErrorPosts}
                        error={errorPosts}
                        setPage={setPostPage}
                        currentUser={loggedInUser ?? undefined}
                        onLikeToggleSuccess={handleLikeToggleSuccess}
                        onLikeToggleError={handleLikeToggleError}
                    />
                 </TabsContent>
            </Tabs>
        </div>
    );
}

export default UserProfilePage;