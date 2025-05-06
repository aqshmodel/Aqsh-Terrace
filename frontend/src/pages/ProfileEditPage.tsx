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
import { Loader2, Terminal, Plus, Edit, Trash2, Briefcase, Calendar, Building, GraduationCap } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { UserProfile, Experience, Education } from '@/types/user';
import { BasicInfoForm, ProfileFormData } from '@/components/forms/BasicInfoForm';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button'; // Button をインポート
import { ExperienceDialog } from '@/components/dialogs/ExperienceDialog';
import { ExperienceFormData } from '@/components/forms/ExperienceForm';
// ★ 学歴用フォーム・ダイアログをインポート
import { EducationDialog } from '@/components/dialogs/EducationDialog';
import { EducationFormData } from '@/components/forms/EducationForm';
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

// ★ 学歴取得・CRUD API 関数を追加
const fetchMyEducations = async (): Promise<Education[]> => {
    const response = await apiClient.get<{ data: Education[] }>('/api/profile/educations');
    return response.data.data;
};
const createEducation = async (data: EducationFormData): Promise<Education> => {
    const response = await apiClient.post<{ data: Education }>('/api/profile/educations', data);
    return response.data.data;
};
const updateEducation = async ({ id, data }: { id: number; data: EducationFormData }): Promise<Education> => {
    const response = await apiClient.put<{ data: Education }>(`/api/profile/educations/${id}`, data);
    return response.data.data;
};
const deleteEducation = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/profile/educations/${id}`);
};

function ProfileEditPage() {
    const { user, isLoading: isAuthLoading, isLoggedIn } = useAuthStore();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // --- ダイアログ状態管理 ---
    const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingExperienceId, setDeletingExperienceId] = useState<number | null>(null);
    // ★ 学歴用ダイアログの状態を追加
    const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
    const [editingEducation, setEditingEducation] = useState<Education | null>(null);
    const [isDeleteEducationDialogOpen, setIsDeleteEducationDialogOpen] = useState(false);
    const [deletingEducationId, setDeletingEducationId] = useState<number | null>(null);

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

    // ★ 学歴データ取得 Query を追加
    const { data: educations, isLoading: isLoadingEducations, error: educationsError } = useQuery<Education[], Error>({
        queryKey: ['myEducations'], // 学歴用のキャッシュキー
        queryFn: fetchMyEducations,
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000,
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

    // ★ 学歴 CRUD Mutation を追加
    const createEducationMutation = useMutation<Education, Error, EducationFormData, unknown>({
        mutationFn: createEducation,
        onSuccess: (newEducation) => {
            queryClient.setQueryData<Education[]>(['myEducations'], (oldData = []) => [newEducation, ...oldData]);
            setIsEducationDialogOpen(false);
            toast({ title: "成功", description: "学歴が追加されました。" });
        },
        onError: (error) => {
             console.error("学歴追加エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "学歴の追加に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
        }
    });
    const updateEducationMutation = useMutation<Education, Error, { id: number; data: EducationFormData }, unknown>({
        mutationFn: updateEducation,
        onSuccess: (updatedEducation) => {
            queryClient.setQueryData<Education[]>(['myEducations'], (oldData = []) =>
                oldData.map(edu => edu.id === updatedEducation.id ? updatedEducation : edu)
            );
            setIsEducationDialogOpen(false);
            setEditingEducation(null);
            toast({ title: "成功", description: "学歴が更新されました。" });
        },
         onError: (error) => {
             console.error("学歴更新エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "学歴の更新に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
        }
    });
    const deleteEducationMutation = useMutation<void, Error, number, unknown>({
        mutationFn: deleteEducation,
        onSuccess: (_, deletedId) => {
            queryClient.setQueryData<Education[]>(['myEducations'], (oldData = []) =>
                oldData.filter(edu => edu.id !== deletedId)
            );
            setIsDeleteEducationDialogOpen(false);
            setDeletingEducationId(null);
            toast({ title: "成功", description: "学歴が削除されました。" });
        },
        onError: (error) => {
             console.error("学歴削除エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "学歴の削除に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
             setIsDeleteEducationDialogOpen(false);
             setDeletingEducationId(null);
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

    // ★ 学歴用ボタンハンドラを追加
    const handleAddNewEducation = () => {
        setEditingEducation(null);
        setIsEducationDialogOpen(true);
    };
    const handleEditEducation = (education: Education) => {
        setEditingEducation(education);
        setIsEducationDialogOpen(true);
    };
    const handleDeleteEducationClick = (id: number) => {
        setDeletingEducationId(id);
        setIsDeleteEducationDialogOpen(true);
    };
     const confirmDeleteEducation = () => {
        if (deletingEducationId) {
            deleteEducationMutation.mutate(deletingEducationId);
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
    if (isLoadingProfile || isLoadingMetadata || isLoadingExperiences || isLoadingEducations) {
         return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    // ★ データ取得エラー表示を統合
    if (profileError || metadataError || experiencesError || educationsError || !currentProfile || !metadata) {
         const errorMsg = profileError?.message || metadataError?.message || experiencesError?.message || educationsError?.message || 'データの取得に失敗しました。';
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

             {/* --- 学歴セクション --- ★ 更新 ★ */}
             <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>学歴</CardTitle>
                        <CardDescription>最終学歴やその他学んだ経験を入力してください。</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleAddNewEducation}>
                         <Plus className="h-4 w-4 mr-2" />
                         新規追加
                     </Button>
                </CardHeader>
                <CardContent>
                    {/* ★ 学歴リスト表示 */}
                    {educations && educations.length > 0 ? (
                        <ul className="space-y-4">
                            {educations.map(edu => (
                                <li key={edu.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <p className="font-semibold">{edu.school_name}</p>
                                            {edu.major && <p className="text-sm text-muted-foreground">{edu.major}</p>}
                                            <p className="text-xs text-muted-foreground mt-0.5"><Calendar className="inline h-3 w-3 mr-1" />{edu.start_date} ～ {edu.end_date ?? '卒業'}</p>
                                        </div>
                                         {/* ★ 編集・削除ボタン */}
                                        <div className="flex space-x-2 flex-shrink-0 ml-4">
                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEducation(edu)}>
                                                 <Edit className="h-4 w-4" />
                                             </Button>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteEducationClick(edu.id)}>
                                                 <Trash2 className="h-4 w-4" />
                                             </Button>
                                        </div>
                                    </div>
                                    {edu.description && (
                                        <p className="mt-1 text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none">{edu.description}</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                     ) : (
                         <p className="text-muted-foreground italic text-center py-4">
                             学歴はまだ登録されていません。「新規追加」ボタンから登録できます。
                         </p>
                     )}
                </CardContent>
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

            {/* ★ EducationDialog をレンダリング */}
            <EducationDialog
                isOpen={isEducationDialogOpen}
                setIsOpen={setIsEducationDialogOpen}
                editingEducation={editingEducation}
                createMutation={createEducationMutation}
                updateMutation={updateEducationMutation}
            />

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

             {/* ★ 学歴削除確認 AlertDialog をレンダリング */}
            <AlertDialog open={isDeleteEducationDialogOpen} onOpenChange={setIsDeleteEducationDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>削除確認</AlertDialogTitle>
                    <AlertDialogDescription>
                        この学歴を削除してもよろしいですか？この操作は元に戻せません。
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingEducationId(null)}>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                         onClick={confirmDeleteEducation}
                         disabled={deleteEducationMutation.isPending}
                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deleteEducationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        削除する
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}

export default ProfileEditPage;