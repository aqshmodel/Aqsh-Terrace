// frontend/src/pages/ProfileEditPage.tsx
import React, { useState } from 'react'; // ★ useState をインポート
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// ★ アイコン追加: Plus, Edit, Trash2, Briefcase, Calendar, Building
import { Loader2, Terminal, Plus, Edit, Trash2, Briefcase, Calendar, Building } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
// ★ Experience 型もインポート
import { UserProfile, Experience } from '@/types/user';
import { BasicInfoForm, ProfileFormData } from '@/components/forms/BasicInfoForm';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button'; // Button をインポート
import { ExperienceDialog } from '@/components/dialogs/ExperienceDialog';
import { ExperienceFormData } from '@/components/forms/ExperienceForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// --- API 関数 ---
const fetchMyProfile = async (): Promise<UserProfile> => {
    const response = await apiClient.get<{ data: UserProfile }>('/api/profile');
    if (!response.data || !response.data.data) {
        throw new Error('User profile data not found in response');
    }
    return response.data.data;
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
};

const updateMyProfile = async (data: ProfileFormData): Promise<UserProfile> => {
    const response = await apiClient.put<{ data: UserProfile }>('/api/profile', data);
    return response.data.data;
}

// ★ 職務経歴取得 API 関数を追加
const fetchMyExperiences = async (): Promise<Experience[]> => {
    // ExperienceResource::collection が配列を返す想定
    const response = await apiClient.get<{ data: Experience[] }>('/api/profile/experiences');
    return response.data.data; // 配列データを返す
};

// ★ 職務経歴 CRUD API 関数を追加
const createExperience = async (data: ExperienceFormData): Promise<Experience> => {
    const response = await apiClient.post<{ data: Experience }>('/api/profile/experiences', data);
    return response.data.data;
};
const updateExperience = async ({ id, data }: { id: number; data: ExperienceFormData }): Promise<Experience> => {
    const response = await apiClient.put<{ data: Experience }>(`/api/profile/experiences/${id}`, data);
    return response.data.data;
};
const deleteExperience = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/profile/experiences/${id}`);
};

function ProfileEditPage() {
    const { user, isLoading: isAuthLoading, isLoggedIn } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // --- ダイアログ状態管理 ---
    const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    // ★ 削除確認ダイアログの状態
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingExperienceId, setDeletingExperienceId] = useState<number | null>(null);

    // --- データ取得 ---
    const { data: currentProfile, isLoading: isLoadingProfile, error: profileError } = useQuery<UserProfile, Error>({
        queryKey: ['myProfile'],
        queryFn: fetchMyProfile,
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000,
    });

    const { data: metadata, isLoading: isLoadingMetadata, error: metadataError } = useQuery<Metadata, Error>({
        queryKey: ['metadata'],
        queryFn: fetchMetadata,
        enabled: isLoggedIn,
        staleTime: Infinity,
        gcTime: Infinity,
        refetchOnWindowFocus: false,
    });

    // ★ 職務経歴データ取得 Query を追加
    const { data: experiences, isLoading: isLoadingExperiences, error: experiencesError } = useQuery<Experience[], Error>({
        queryKey: ['myExperiences'], // 職務経歴用のキャッシュキー
        queryFn: fetchMyExperiences,
        enabled: isLoggedIn, // ログイン時のみ有効
        staleTime: 5 * 60 * 1000, // 5分キャッシュ
    });


    // --- プロフィール更新 Mutation ---
    const updateProfileMutation = useMutation<UserProfile, Error, ProfileFormData, unknown>({
        mutationFn: updateMyProfile,
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(['myProfile'], updatedProfile);
            if (user?.id) {
                queryClient.setQueryData(['user', user.id.toString()], updatedProfile);
            }
            toast({
                title: "成功",
                description: "基本情報が更新されました。",
            });
        },
        onError: (error) => {
            console.error("基本情報更新エラー:", error);
            const errorMessage = (error as any)?.response?.data?.message || error.message || "基本情報の更新に失敗しました。";
            toast({
                title: "エラー",
                description: errorMessage,
                variant: "destructive",
            });
        },

    });

    // --- 職務経歴 CRUD Mutation ---
    // ★ 作成 Mutation
    const createExperienceMutation = useMutation<Experience, Error, ExperienceFormData, unknown>({
        mutationFn: createExperience,
        onSuccess: (newExperience) => {
            // キャッシュ更新: 新しいデータをリストの先頭に追加
            queryClient.setQueryData<Experience[]>(['myExperiences'], (oldData = []) => [newExperience, ...oldData]);
            setIsExperienceDialogOpen(false); // ダイアログを閉じる
            toast({ title: "成功", description: "職務経歴が追加されました。" });
        },
        onError: (error) => {
             console.error("職務経歴追加エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "職務経歴の追加に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
        }
    });

    // ★ 更新 Mutation
    const updateExperienceMutation = useMutation<Experience, Error, { id: number; data: ExperienceFormData }, unknown>({
        mutationFn: updateExperience,
        onSuccess: (updatedExperience) => {
             // キャッシュ更新: 更新されたデータでリストを置き換え
            queryClient.setQueryData<Experience[]>(['myExperiences'], (oldData = []) =>
                oldData.map(exp => exp.id === updatedExperience.id ? updatedExperience : exp)
            );
            setIsExperienceDialogOpen(false); // ダイアログを閉じる
            setEditingExperience(null);      // 編集対象をリセット
            toast({ title: "成功", description: "職務経歴が更新されました。" });
        },
         onError: (error) => {
             console.error("職務経歴更新エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "職務経歴の更新に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
        }
    });

    // ★ 削除 Mutation
    const deleteExperienceMutation = useMutation<void, Error, number, unknown>({
        mutationFn: deleteExperience,
        onSuccess: (_, deletedId) => { // 第2引数で削除IDを受け取る
            // キャッシュ更新: 削除されたデータをリストから除外
            queryClient.setQueryData<Experience[]>(['myExperiences'], (oldData = []) =>
                oldData.filter(exp => exp.id !== deletedId)
            );
            setIsDeleteDialogOpen(false); // 削除確認ダイアログを閉じる
            setDeletingExperienceId(null); // 削除対象IDをリセット
            toast({ title: "成功", description: "職務経歴が削除されました。" });
        },
        onError: (error) => {
             console.error("職務経歴削除エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "職務経歴の削除に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
             setIsDeleteDialogOpen(false); // エラー時もダイアログを閉じる
             setDeletingExperienceId(null);
        }
    });

    // --- ボタンハンドラ ---
    const handleAddNewExperience = () => {
        setEditingExperience(null); // 新規追加モード
        setIsExperienceDialogOpen(true);
    };

    const handleEditExperience = (experience: Experience) => {
        setEditingExperience(experience); // 編集対象を設定
        setIsExperienceDialogOpen(true);
    };

    const handleDeleteExperienceClick = (id: number) => {
        setDeletingExperienceId(id); // 削除対象IDを設定
        setIsDeleteDialogOpen(true); // 削除確認ダイアログを開く
    };

     const confirmDeleteExperience = () => {
        if (deletingExperienceId) {
            deleteExperienceMutation.mutate(deletingExperienceId);
        }
    };


    // --- ローディング・エラーハンドリング ---
    if (isAuthLoading) { // 認証状態チェック中
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    if (!isLoggedIn || !user) { // 未認証
        return <Navigate to="/login" replace />;
    }
    // ★ データ取得中のローディング表示を統合
    if (isLoadingProfile || isLoadingMetadata || isLoadingExperiences) {
         return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    // ★ データ取得エラー表示を統合
    if (profileError || metadataError || experiencesError || !currentProfile || !metadata) {
         const errorMsg = profileError?.message || metadataError?.message || experiencesError?.message || 'データの取得に失敗しました。';
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

            {/* --- 基本情報編集フォーム --- */}
            <Card>
                <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>あなたのアカウント情報を編集します。</CardDescription>
                </CardHeader>
                <CardContent>
                    <BasicInfoForm
                        initialData={currentProfile}
                        metadata={metadata}
                        onSubmit={updateProfileMutation.mutate}
                        isPending={updateProfileMutation.isPending}
                    />
                </CardContent>
            </Card>

             {/* --- 職務経歴セクション --- ★ 更新 ★ */}
             <Card className="mt-6">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>職務経歴</CardTitle>
                        <CardDescription>これまでの職務経験を入力してください。</CardDescription>
                    </div>
                     {/* ★ 新規追加ボタン */}
                     <Button variant="outline" size="sm" onClick={handleAddNewExperience}>
                         <Plus className="h-4 w-4 mr-2" />
                         新規追加
                     </Button>
                 </CardHeader>
                 <CardContent>
                     {/* ★ 職務経歴リスト表示 */}
                     {experiences && experiences.length > 0 ? (
                         <ul className="space-y-6">
                             {experiences.map(exp => (
                                 <li key={exp.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                                     <div className="flex justify-between items-start mb-2">
                                         <div>
                                             <p className="font-semibold">{exp.position} <span className="font-normal text-muted-foreground">@</span> {exp.company_name}</p>
                                             <div className="text-xs sm:text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                 <span className="flex items-center"><Calendar className="inline h-3 w-3 mr-1" />{exp.start_date} ～ {exp.end_date ?? '現在'}</span>
                                                 {exp.industry_label && <span className="flex items-center"><Briefcase className="inline h-3 w-3 mr-1" />{exp.industry_label}</span>}
                                                 {exp.company_size_label && <span className="flex items-center"><Building className="inline h-3 w-3 mr-1" />{exp.company_size_label}</span>}
                                             </div>
                                         </div>
                                         {/* ★ 編集・削除ボタン */}
                                         <div className="flex space-x-2 flex-shrink-0 ml-4">
                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditExperience(exp)}>
                                                 <Edit className="h-4 w-4" />
                                             </Button>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteExperienceClick(exp.id)}>
                                                 <Trash2 className="h-4 w-4" />
                                             </Button>
                                         </div>
                                     </div>
                                     {exp.description && (
                                         <p className="mt-2 text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{exp.description}</p>
                                     )}
                                 </li>
                             ))}
                         </ul>
                     ) : (
                         // ★ 職務経歴がない場合の表示
                         <p className="text-muted-foreground italic text-center py-4">
                             職務経歴はまだ登録されていません。「新規追加」ボタンから登録できます。
                         </p>
                     )}
                 </CardContent>
             </Card>

             {/* --- 学歴セクション (開発中) --- */}
             <Card className="mt-6">
                <CardHeader><CardTitle>学歴</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>

             {/* --- スキルセクション (開発中) --- */}
             <Card className="mt-6">
                <CardHeader><CardTitle>スキル</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>

             {/* --- ポートフォリオセクション (開発中) --- */}
             <Card className="mt-6">
                <CardHeader><CardTitle>ポートフォリオ</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>

            {/* --- モーダルダイアログ --- */}
            {/* ★ ExperienceDialog をレンダリング */}
            {/* metadata が null でないことを保証 */}
            {metadata && (
                 <ExperienceDialog
                    isOpen={isExperienceDialogOpen}
                    setIsOpen={setIsExperienceDialogOpen}
                    editingExperience={editingExperience}
                    metadata={metadata} // 必要なメタデータのみ渡す
                    createMutation={createExperienceMutation}
                    updateMutation={updateExperienceMutation}
                />
            )}

            {/* ★ 削除確認 AlertDialog をレンダリング */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>削除確認</AlertDialogTitle>
                    <AlertDialogDescription>
                        この職務経歴を削除してもよろしいですか？この操作は元に戻せません。
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingExperienceId(null)}>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                         onClick={confirmDeleteExperience}
                         disabled={deleteExperienceMutation.isPending} // 削除処理中無効化
                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90" // 削除ボタンの色
                    >
                        {deleteExperienceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        削除する
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}

export default ProfileEditPage;
