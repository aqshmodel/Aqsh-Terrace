// frontend/src/pages/ProfileEditPage.tsx
import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Terminal } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { UserProfile } from '@/types/user'; // UserProfile 型をインポート
import { BasicInfoForm, ProfileFormData } from '@/components/forms/BasicInfoForm'; // ★ 作成するフォームコンポーネントをインポート
import { useToast } from "@/hooks/use-toast";

// --- API 関数 ---
// ログインユーザー自身のプロフィール情報を取得
const fetchMyProfile = async (): Promise<UserProfile> => {
    // 注意: UserResource は email を含む場合があるが、API ルート '/api/profile' が
    // 認証済みユーザー自身の情報を返すことを想定
    const response = await apiClient.get<{ data: UserProfile }>('/api/profile');
    if (!response.data || !response.data.data) {
        throw new Error('User profile data not found in response');
    }
    return response.data.data;
};

// メタデータ取得 (UserProfilePage と同じ)
interface Metadata {
    industries: Record<string, string>;
    company_types: Record<string, string>;
    company_sizes: Record<string, string>; // 必要なら
    skill_types: Record<string, string>;   // 必要なら
    skill_levels: Record<string, string>;  // 必要なら
}
const fetchMetadata = async (): Promise<Metadata> => {
    const response = await apiClient.get<Metadata>('/api/metadata');
    return response.data;
};

// プロフィール更新API呼び出し関数
const updateMyProfile = async (data: ProfileFormData): Promise<UserProfile> => {
     // UserResource が返却される想定
    const response = await apiClient.put<{ data: UserProfile }>('/api/profile', data);
    return response.data.data;
}


function ProfileEditPage() {
    const { user, isLoading: isAuthLoading, isLoggedIn } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast(); // ★ トーストフック

    // --- データ取得 ---
    // ログインユーザーのプロフィール情報を取得
    const { data: currentProfile, isLoading: isLoadingProfile, error: profileError } = useQuery<UserProfile, Error>({
        queryKey: ['myProfile'], // ログインユーザー自身のプロフィールキャッシュキー
        queryFn: fetchMyProfile,
        enabled: isLoggedIn, // ログインしている場合のみ有効
        staleTime: 5 * 60 * 1000, // 5分キャッシュ
    });

    // メタデータを取得
    const { data: metadata, isLoading: isLoadingMetadata, error: metadataError } = useQuery<Metadata, Error>({
        queryKey: ['metadata'],
        queryFn: fetchMetadata,
        enabled: isLoggedIn, // ログインしている場合のみ有効
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    // --- プロフィール更新 Mutation ---
    const updateProfileMutation = useMutation<UserProfile, Error, ProfileFormData, unknown>({
        mutationFn: updateMyProfile,
        onSuccess: (updatedProfile) => {
            // キャッシュ更新 (自分のプロフィール表示ページなど)
            // '/api/profile' のキャッシュを更新
            queryClient.setQueryData(['myProfile'], updatedProfile);
            // UserProfilePage (/users/:userId) のキャッシュも更新 (自分のIDの場合)
            if (user?.id) {
                queryClient.setQueryData(['user', user.id.toString()], updatedProfile);
                // 必要であれば、ユーザー一覧などのキャッシュも無効化
                // queryClient.invalidateQueries({ queryKey: ['users'] });
            }
            // Zustand ストアのユーザー情報も更新 (任意)
            // const { login } = useAuthStore.getState();
            // login({ id: updatedProfile.id, name: updatedProfile.name, email: updatedProfile.email });

            toast({
                title: "成功",
                description: "プロフィール情報が更新されました。",
            });
        },
        onError: (error) => {
            console.error("プロフィール更新エラー:", error);
            // エラーレスポンスから詳細を取得できる場合
            const errorMessage = (error as any)?.response?.data?.message || error.message || "プロフィールの更新に失敗しました。";
            toast({
                title: "エラー",
                description: errorMessage,
                variant: "destructive",
            });
             // 必要であれば、キャッシュを無効化して再同期を促す
             // queryClient.invalidateQueries({ queryKey: ['myProfile'] });
        },
    });


    // --- ローディング・エラーハンドリング ---
    // 認証状態の読み込み中
    if (isAuthLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    // 未認証の場合はログインページへリダイレクト
    if (!isLoggedIn || !user) {
        return <Navigate to="/login" replace />;
    }
    // プロフィール情報 or メタデータ取得中
    if (isLoadingProfile || isLoadingMetadata) {
         return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    // プロフィール情報 or メタデータ取得エラー
    if (profileError || metadataError || !currentProfile || !metadata) {
         const errorMsg = profileError?.message || metadataError?.message || 'データの取得に失敗しました。';
         return (
            <div className="container mx-auto max-w-3xl px-4 py-8">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>エラー</AlertTitle>
                    <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // --- レンダリング ---
    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">プロフィール編集</h1>

            {/* 基本情報編集フォーム */}
            <Card>
                <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>あなたのアカウント情報を編集します。</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* ★ フォームコンポーネントを呼び出し */}
                    <BasicInfoForm
                        initialData={currentProfile}
                        metadata={metadata}
                        onSubmit={updateProfileMutation.mutate} // ★ mutate 関数を渡す
                        isPending={updateProfileMutation.isPending} // ★ ローディング状態を渡す
                    />
                </CardContent>
            </Card>

             {/* 他のセクション (職務経歴、学歴、スキル、ポートフォリオ) の Card も同様に追加 */}
             {/* (これらのフォームは別途実装) */}
             <Card className="mt-6">
                <CardHeader><CardTitle>職務経歴</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>学歴</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>スキル</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>ポートフォリオ</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
        </div>
    );
}

export default ProfileEditPage;