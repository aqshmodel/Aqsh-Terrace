// frontend/src/pages/UserProfilePage.tsx
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import {
    UserProfile,
    PaginatedUserPostsResponse,
    UserSkill,
} from '@/types/user';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    ExternalLink, MapPin, Mail, Edit, Loader2, Github, Twitter, Linkedin, Facebook, Instagram,
    Building, GraduationCap, UserCheck, UserPlus, Briefcase, Lightbulb, BookOpen, Star,
    Calendar, MessageSquare, Terminal, MoreHorizontal, User as UserIcon,
    Link as LinkIcon,
    Settings
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import { PostList } from '@/components/PostList';
import useAuthStore from '@/stores/authStore';
import { useState, useEffect, useCallback } from 'react';
import useDocumentTitle from '@/hooks/useDocumentTitle';

// --- API 関数 ---
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
    const response = await apiClient.get<{ data: UserProfile }>(`/api/users/${userId}`);
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

    const { data: metadata } = useQuery<Metadata, Error>({
        queryKey: ['metadata'],
        queryFn: fetchMetadata,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    if (!userId) {
        navigate('/404');
        return null;
    }
    const parsedUserId = parseInt(userId, 10);

    const { data: profile, isLoading, error } = useQuery<UserProfile, Error>({
        queryKey: ['user', userId],
        queryFn: () => fetchUserProfile(userId),
        enabled: !!userId,
        staleTime: 5 * 60 * 1000,
    });

    useDocumentTitle(profile?.name ? `Aqsh Terrace | ${profile.name}さん` : 'Aqsh Terrace | ユーザープロフィール');

    const userPostsQueryKey = ['userPosts', userId, postPage];
    const { data: postsData, isLoading: isLoadingPosts, isFetching: isFetchingPosts, isError: isErrorPosts, error: errorPosts } = useQuery<PaginatedUserPostsResponse, Error>({
        queryKey: userPostsQueryKey,
        queryFn: () => fetchUserPosts(userId, postPage),
        enabled: !!userId && !!profile,
        placeholderData: keepPreviousData,
        staleTime: 1 * 60 * 1000,
    });

    const followMutation = useMutation<void, Error, void, unknown>({
        mutationFn: () => followUser(parsedUserId),
        onSuccess: () => {
            queryClient.setQueryData<UserProfile>(['user', userId], (oldData) => {
                if (!oldData) return oldData;
                return { ...oldData, is_following: true, followers_count: (oldData.followers_count ?? 0) + 1 };
            });
            queryClient.invalidateQueries({ queryKey: ['followers', userId] });
            queryClient.invalidateQueries({ queryKey: ['followings', loggedInUser?.id] });
        },
        onError: (err) => {
            console.error("フォローエラー:", err);
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        }
    });

    const unfollowMutation = useMutation<void, Error, void, unknown>({
        mutationFn: () => unfollowUser(parsedUserId),
        onSuccess: () => {
             queryClient.setQueryData<UserProfile>(['user', userId], (oldData) => {
                if (!oldData) return oldData;
                return { ...oldData, is_following: false, followers_count: Math.max(0, (oldData.followers_count ?? 0) - 1) };
            });
            queryClient.invalidateQueries({ queryKey: ['followers', userId] });
            queryClient.invalidateQueries({ queryKey: ['followings', loggedInUser?.id] });
        },
        onError: (err) => {
            console.error("アンフォローエラー:", err);
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        }
    });

    const handleLikeToggleSuccess = useCallback((postId: number, newLikedStatus: boolean, newLikesCount: number) => {
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

    const handleLikeToggleError = useCallback((error: Error, postId: number) => {
        console.error(`[UserProfilePage] Received like error for post ${postId}:`, error);
        queryClient.invalidateQueries({ queryKey: ['userPosts', userId] });
    }, [queryClient, userId]);


    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">ユーザー情報を読み込んでいます...</p>
            </div>
        );
    }
    if (error || !profile) {
        const errorStatus = (error as any)?.response?.status;
        const errorMessage = error?.message || 'ユーザー情報の取得に失敗しました。';
        const errorTitle = errorStatus === 404 ? 'ユーザーが見つかりません' : 'エラーが発生しました';
        return (
            <div className="container mx-auto max-w-2xl py-12">
                <Alert variant="destructive">
                    <Terminal className="h-5 w-5" />
                    <AlertTitle className="text-lg">{errorTitle}</AlertTitle>
                    <AlertDescription className="mt-1">{errorMessage}</AlertDescription>
                    <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
                        ホームに戻る
                    </Button>
                </Alert>
            </div>
        );
    }

    const isOwner = profile.is_owner;

    // ★★★ groupSkillsByType 関数の定義をコンポーネント内に移動 ★★★
    const groupSkillsByType = (skills: UserSkill[] | undefined | null): Record<string, UserSkill[]> => {
        if (!skills) return {};
        return skills.reduce((acc, skill) => {
            const typeKey = skill.type || 'その他';
            if (!acc[typeKey]) acc[typeKey] = [];
            acc[typeKey].push(skill);
            return acc;
        }, {} as Record<string, UserSkill[]>);
    };
    const groupedSkills = groupSkillsByType(profile?.skills);


    const renderSocialLinks = () => {
         if (!profile.social_links || Object.keys(profile.social_links).length === 0) return null;
         const socialLinkConfig = [
             { key: 'github', icon: Github, label: 'GitHub' },
             { key: 'twitter', icon: Twitter, label: 'Twitter/X' },
             { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
             { key: 'facebook', icon: Facebook, label: 'Facebook' },
             { key: 'instagram', icon: Instagram, label: 'Instagram' },
         ];
         const links = socialLinkConfig
            .map(sl => profile.social_links[sl.key] ? { ...sl, url: profile.social_links[sl.key] } : null)
            .filter(Boolean);

         if (links.length === 0) return null;

         return (
             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                 {links.map((link) => (
                    link && (
                     <a key={link.label} href={link.url!} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group">
                         <link.icon className="h-5 w-5 mr-1.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                         <span className="hidden sm:inline">{link.label}</span>
                         <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
                     </a>
                    )
                 ))}
             </div>
         );
    };

    const renderLabelsFromArray = (keys: string[] | undefined | null, configKey: keyof Metadata, icon?: React.ElementType, title?: string) => {
        if (!keys || keys.length === 0 || !metadata) return null;
        const labelMap = metadata[configKey];
        if (!labelMap) return null;
        const IconComponent = icon;
        return (
            <div className="mt-4">
                {title && <h3 className="text-sm font-semibold text-muted-foreground mb-1.5">{title}</h3>}
                <div className="flex flex-wrap items-center gap-1.5">
                    {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground flex-shrink-0 mr-1" />}
                    {keys.map(key => (
                        <Badge key={key} variant="secondary" className="text-xs font-normal px-2.5 py-1">
                            {labelMap[key] || key}
                        </Badge>
                    ))}
                </div>
            </div>
        );
    };

    // --- JSX レンダリング本体 ---
    return (
        <div className="container mx-auto max-w-[1360px] px-4 py-8 sm:py-12">
            <header className="mb-8 md:mb-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-80 w-80 sm:h-80 sm:w-80 rounded-lg border-2 border-border shadow-lg">
                            <AvatarImage src={profile.profile_image_url ?? undefined} alt={profile.name} className="object-cover rounded-lg" />
                            <AvatarFallback className="text-7xl rounded-lg bg-muted">
                                {profile.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 w-full text-center lg:text-left">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2">
                            <div className="lg:flex-grow">
                                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">{profile.name}</h1>
                                <div className="lg:flex lg:justify-between lg:items-center w-full mt-5">
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-base text-muted-foreground flex-wrap">
                                    {profile.location && (
                                        <span className="flex items-center">
                                            <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
                                            {profile.location}
                                        </span>
                                    )}
                                    {profile.current_company_name && (
                                        <span className="flex items-center">
                                            <Building className="h-5 w-5 mr-2 flex-shrink-0" />
                                            {profile.current_company_name}
                                            {profile.current_company_url && (
                                                <a href={profile.current_company_url} target="_blank" rel="noopener noreferrer" className="ml-1.5 flex items-center hover:text-primary transition-colors">
                                                    <LinkIcon className="h-4 w-4" />
                                                </a>
                                            )}
                                        </span>
                                    )}
                                    <span className="flex items-center">
                                        <Calendar className="h-5 w-5 mr-2 flex-shrink-0" />
                                        登録: {formatRelativeTime(profile.created_at)}
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 w-full sm:w-auto lg:w-auto lg:flex-shrink-0 justify-center lg:justify-end">
                                {isOwner && (
                                    <Button variant="outline" size="default" className="w-full sm:w-auto" asChild>
                                        <Link to="/profile/edit">
                                            <Settings className="h-4 w-4 mr-2" /> プロフィール編集
                                        </Link>
                                    </Button>
                                )}
                                {!isOwner && isLoggedIn && profile.is_following !== undefined && (
                                    profile.is_following ? (
                                        <Button
                                            variant="outline" size="default"
                                            className="w-full sm:w-auto"
                                            onClick={() => unfollowMutation.mutate()}
                                            disabled={unfollowMutation.isPending || followMutation.isPending}
                                        >
                                            {unfollowMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserCheck className="mr-2 h-4 w-4" />}
                                            フォロー中
                                        </Button>
                                    ) : (
                                        <Button
                                            size="default"
                                            className="w-full sm:w-auto"
                                            onClick={() => followMutation.mutate()}
                                            disabled={followMutation.isPending || unfollowMutation.isPending}
                                        >
                                            {followMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UserPlus className="mr-2 h-4 w-4" />}
                                            フォローする
                                        </Button>
                                    )
                                )}
                                {!isLoggedIn && !isOwner && (
                                    <Button disabled size="default" className="w-full sm:w-auto">
                                       <UserPlus className="mr-2 h-4 w-4" /> フォロー (ログイン)
                                    </Button>
                                )}
                            </div></div>
                                {profile.headline && <p className="text-xl sm:text-2xl text-muted-foreground mt-2 sm:mt-2.5 mx-auto lg:mx-0">{profile.headline}</p>}

                                <div className="mt-5 border-t border-border pt-1">
                                    {renderLabelsFromArray(profile.experienced_industries, 'industries', Briefcase, '経験業界')}
                                    {renderLabelsFromArray(profile.experienced_company_types, 'company_types', Building, '経験企業タイプ')}
                                </div>
                                {renderSocialLinks()}
                            </div>

                        </div>
                    </div>
                </div>

                {(profile.followings_count !== undefined || profile.followers_count !== undefined || profile.posts_count !== undefined) && (
                    <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-3 mt-8 pt-8 border-t border-border">
                        {[
                            { count: profile.followings_count, label: 'フォロー中', link: `/users/${userId}/following` },
                            { count: profile.followers_count, label: 'フォロワー', link: `/users/${userId}/followers` },
                            { count: profile.posts_count, label: '投稿' }
                        ].map(item => (
                            item.count !== undefined && (
                                item.link ? (
                                    <Link key={item.label} to={item.link} className="text-center hover:opacity-80 transition-opacity">
                                        <div className="text-2xl sm:text-3xl font-bold text-foreground">{item.count}</div>
                                        <div className="text-sm sm:text-base text-muted-foreground">{item.label}</div>
                                    </Link>
                                ) : (
                                    <div key={item.label} className="text-center">
                                        <div className="text-2xl sm:text-3xl font-bold text-foreground">{item.count}</div>
                                        <div className="text-sm sm:text-base text-muted-foreground">{item.label}</div>
                                    </div>
                                )
                            )
                        ))}
                    </div>
                )}
            </header>

            <Tabs defaultValue="introduction" className="w-full">
                <TabsList className="grid w-full h-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 mb-6 sm:mb-8 border-b rounded-none justify-start overflow-x-auto sm:overflow-visible pb-0">
                    {[
                        { value: "introduction", label: "概要", icon: UserIcon },
                        { value: "experience", label: "職務経歴", icon: Briefcase },
                        { value: "education", label: "学歴", icon: GraduationCap },
                        { value: "skills", label: "スキル", icon: Lightbulb },
                        { value: "portfolio", label: "ポートフォリオ", icon: BookOpen },
                        { value: "posts", label: "投稿", icon: MessageSquare }
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-3 sm:px-4 py-2.5 text-sm sm:text-base whitespace-nowrap hover:bg-muted/50 transition-colors"
                        >
                            <tab.icon className="h-4 w-4 mr-2 hidden sm:inline-flex" />
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="introduction">
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl sm:text-2xl">概要・自己紹介</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
                             {profile.introduction || <p className="text-muted-foreground italic">自己紹介はまだ登録されていません。</p>}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="experience">
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl sm:text-2xl">職務経歴</CardTitle></CardHeader>
                        <CardContent>
                            {profile.experiences && profile.experiences.length > 0 ? (
                                <div className="space-y-8">
                                    {profile.experiences.map(exp => (
                                        <div key={exp.id} className="relative pl-8 before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-border">
                                            <div className="absolute w-3 h-3 bg-primary rounded-full left-[7.5px] top-1.5 border-2 border-background"></div>
                                            <p className="font-semibold text-md sm:text-lg text-foreground">{exp.position}</p>
                                            <p className="text-sm sm:text-base text-muted-foreground">{exp.company_name}</p>
                                            <div className="text-xs sm:text-sm text-muted-foreground/80 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="flex items-center"><Calendar className="inline h-3.5 w-3.5 mr-1" />{exp.start_date} ～ {exp.end_date ?? '現在'}</span>
                                                {exp.industry_label && <span className="flex items-center"><Briefcase className="inline h-3.5 w-3.5 mr-1" />{exp.industry_label}</span>}
                                                {exp.company_size_label && <span className="flex items-center"><Building className="inline h-3.5 w-3.5 mr-1" />{exp.company_size_label}</span>}
                                            </div>
                                            {exp.description && <CardDescription className="mt-2 text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none leading-relaxed">{exp.description}</CardDescription>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">職務経歴はまだ登録されていません。</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="education">
                     <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl sm:text-2xl">学歴</CardTitle></CardHeader>
                        <CardContent>
                             {profile.educations && profile.educations.length > 0 ? (
                                <div className="space-y-6">
                                    {profile.educations.map(edu => (
                                        <div key={edu.id} className="relative pl-8 before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-border">
                                            <div className="absolute w-3 h-3 bg-primary rounded-full left-[7.5px] top-1.5 border-2 border-background"></div>
                                            <p className="font-semibold text-md sm:text-lg text-foreground">{edu.school_name}</p>
                                            {edu.major && <p className="text-sm sm:text-base text-muted-foreground">{edu.major}</p>}
                                            <p className="text-xs sm:text-sm text-muted-foreground/80 mt-1"><Calendar className="inline h-3.5 w-3.5 mr-1" />{edu.start_date} ～ {edu.end_date ?? '卒業'}</p>
                                            {edu.description && <CardDescription className="mt-2 text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none leading-relaxed">{edu.description}</CardDescription>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground italic">学歴はまだ登録されていません。</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="skills">
                     <Card className="shadow-sm">
                         <CardHeader><CardTitle className="text-xl sm:text-2xl">スキル</CardTitle></CardHeader>
                         <CardContent className="space-y-6">
                             {/* ★★★ groupedSkills のチェックと Object.entries の修正箇所 ★★★ */}
                             {profile?.skills && profile.skills.length > 0 && Object.keys(groupedSkills).length > 0 ? (
                                 Object.entries(groupedSkills).map(([type, skillsArray]: [string, UserSkill[]]) => (
                                     <div key={type}>
                                         <h3 className="text-lg font-semibold mb-3 text-foreground border-b pb-1.5">
                                             {metadata?.skill_types[type] || type}
                                         </h3>
                                         <div className="flex flex-wrap gap-2.5">
                                             {skillsArray.map(skill => (
                                                 <Badge key={skill.id} variant="outline" className="px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
                                                     {skill.name}
                                                     {skill.user_details?.level_label && (
                                                          <span className="ml-2 text-xs opacity-80 flex items-center">
                                                              <Star className="h-3.5 w-3.5 mr-1 fill-yellow-400 text-yellow-500"/>
                                                              {skill.user_details.level_label}
                                                          </span>
                                                     )}
                                                      {skill.user_details?.years_of_experience !== undefined && skill.user_details.years_of_experience !== null && (
                                                          <span className="ml-2 text-xs opacity-80">({skill.user_details.years_of_experience}年)</span>
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

                <TabsContent value="portfolio">
                    <Card className="shadow-sm">
                        <CardHeader><CardTitle className="text-xl sm:text-2xl">ポートフォリオ</CardTitle></CardHeader>
                        <CardContent>
                             {profile.portfolio_items && profile.portfolio_items.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    {profile.portfolio_items.map(item => (
                                        <Card key={item.id} className="overflow-hidden flex flex-col border hover:shadow-lg transition-shadow">
                                            <CardHeader className="pb-2 pt-4">
                                                <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                                                 {item.url && (
                                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center break-all mt-1 group">
                                                        <LinkIcon className="h-4 w-4 mr-1.5 flex-shrink-0 group-hover:scale-110 transition-transform"/>
                                                        <span className="truncate">{item.url}</span>
                                                        <ExternalLink className="h-3.5 w-3.5 ml-1.5 flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                 )}
                                            </CardHeader>
                                            {item.description && (
                                                <CardContent className="flex-grow pt-0 pb-4">
                                                    <p className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none line-clamp-4 leading-relaxed">{item.description}</p>
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

                <TabsContent value="posts">
                    <div className="border rounded-lg shadow-sm bg-card">
                        <CardHeader>
                            <CardTitle className="text-xl sm:text-2xl">{profile.name}さんの投稿</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-2 md:p-4">
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
                        </CardContent>
                    </div>
                 </TabsContent>
            </Tabs>
        </div>
    );
}

export default UserProfilePage;