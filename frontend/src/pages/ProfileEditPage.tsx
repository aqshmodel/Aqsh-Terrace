// frontend/src/pages/ProfileEditPage.tsx
import React, { useState, useEffect } from 'react'; // ★ useCallback, useRef は不要に
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// ★ アイコン整理: Search, ChevronsUpDown は不要に
import { Loader2, Terminal, Plus, Edit, Trash2, Briefcase, Calendar, Building, GraduationCap, Lightbulb, X, Check, Star, BookOpen, Link as LinkIcon, ExternalLink } from 'lucide-react';
import useAuthStore from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
// ★ SkillMaster 型をインポート
import { UserProfile, Experience, Education, UserSkill, Skill as SkillMaster, PortfolioItem } from '@/types/user';
import { BasicInfoForm, ProfileFormData } from '@/components/forms/BasicInfoForm';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { ExperienceDialog } from '@/components/dialogs/ExperienceDialog';
import { ExperienceFormData } from '@/components/forms/ExperienceForm';
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
import { SkillItem } from '@/components/profile/SkillItem';
import { SkillDialog } from '@/components/dialogs/SkillDialog';
import { SkillFormData } from '@/components/forms/SkillForm'; // SkillFormData インポート
// import { SkillCombobox } from '@/components/profile/SkillCombobox';
import { SkillAsyncSelect } from '@/components/profile/SkillAsyncSelect'; // react-select を使うコンポーネント
import { Label } from "@/components/ui/label"; // Label をインポート
// ★ react-select の型をインポート
import { InputActionMeta } from 'react-select';
import { Badge } from "@/components/ui/badge";
import { PortfolioDialog } from '@/components/dialogs/PortfolioDialog';
import { PortfolioFormData } from '@/components/forms/PortfolioForm';

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

// ★ スキル一括更新 API 関数
const updateMySkills = async (skillsData: Array<{ skill_id: number; level: number | null; years_of_experience: number | null; description: string | null }>): Promise<UserSkill[]> => {
    // API は UserResource (skills を含む) を返す想定だが、ここでは更新後のスキルリストを返すことにする
    const response = await apiClient.put<{ data: UserProfile }>('/api/profile/skills', { skills: skillsData });
     // UserResource から skills を抽出して返す
     if (!response.data || !response.data.data || !response.data.data.skills) {
        throw new Error('Updated skills data not found in response');
     }
    return response.data.data.skills;
};

// ★ ポートフォリオ取得・CRUD API 関数を追加
const fetchMyPortfolioItems = async (): Promise<PortfolioItem[]> => {
    const response = await apiClient.get<{ data: PortfolioItem[] }>('/api/profile/portfolio-items');
    return response.data.data;
};
const createPortfolioItem = async (data: PortfolioFormData): Promise<PortfolioItem> => {
    const response = await apiClient.post<{ data: PortfolioItem }>('/api/profile/portfolio-items', data);
    return response.data.data;
};
const updatePortfolioItem = async ({ id, data }: { id: number; data: PortfolioFormData }): Promise<PortfolioItem> => {
    const response = await apiClient.put<{ data: PortfolioItem }>(`/api/profile/portfolio-items/${id}`, data);
    return response.data.data;
};
const deletePortfolioItem = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/profile/portfolio-items/${id}`);
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
    // ★ スキル関連の状態を追加
    const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
    const [isDeleteSkillDialogOpen, setIsDeleteSkillDialogOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);
    const [deletingSkillId, setDeletingSkillId] = useState<number | null>(null);
    // ★ スキル編集用 State　現在のユーザースキルリスト (編集用)
    const [managedSkills, setManagedSkills] = useState<UserSkill[]>([]);
    // ★ スキル検索の入力値を管理する State を追加
    const [skillInputValue, setSkillInputValue] = useState('');
    // ★ ポートフォリオ用ダイアログの状態を追加
    const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
    const [editingPortfolioItem, setEditingPortfolioItem] = useState<PortfolioItem | null>(null);
    const [isDeletePortfolioDialogOpen, setIsDeletePortfolioDialogOpen] = useState(false);
    const [deletingPortfolioItemId, setDeletingPortfolioItemId] = useState<number | null>(null);

    // --- データ取得 ---
    const { data: currentProfile, isLoading: isLoadingProfile, error: profileError } = useQuery<UserProfile, Error>({
        queryKey: ['myProfile'],
        queryFn: fetchMyProfile,
        enabled: isLoggedIn,
        staleTime: 5 * 60 * 1000,
    });

    // ★ 初期スキルデータを managedSkills にセット (currentProfile が変更されたら)
    useEffect(() => {
        if (currentProfile?.skills) {
            setManagedSkills(currentProfile.skills);
        }
    }, [currentProfile?.skills]);

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

    // ★ ポートフォリオデータ取得 Query を追加
    const { data: portfolioItems, isLoading: isLoadingPortfolio, error: portfolioError } = useQuery<PortfolioItem[], Error>({
        queryKey: ['myPortfolioItems'], // ポートフォリオ用のキャッシュキー
        queryFn: fetchMyPortfolioItems,
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

    // ★ 学歴 CRUD Mutation
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

    // ★ スキル一括更新 Mutation
    const updateSkillsMutation = useMutation<
        UserSkill[], // onSuccess で受け取る型
        Error,
        Array<{ skill_id: number; level: number | null; years_of_experience: number | null; description: string | null }>, // mutate に渡す型
        unknown
    >({
        mutationFn: updateMySkills,
        onSuccess: (updatedSkills) => {
            // ★ 成功したらフロントエンドの状態も更新
            setManagedSkills(updatedSkills);
            // キャッシュも更新
            queryClient.setQueryData<UserProfile>(['myProfile'], (oldData) => oldData ? { ...oldData, skills: updatedSkills } : oldData);
            if (user?.id) {
                 queryClient.setQueryData<UserProfile>(['user', user.id.toString()], (oldData) => oldData ? { ...oldData, skills: updatedSkills } : oldData);
             }
            // ★ ダイアログを閉じる処理を追加
            setIsSkillDialogOpen(false);
            setIsDeleteSkillDialogOpen(false); // 削除の場合も閉じる
            setEditingSkill(null); // 編集状態を解除
            setDeletingSkillId(null); // 削除状態を解除
            toast({ title: "成功", description: "スキル情報が更新されました。" });
        },
        onError: (error) => {
            console.error("スキル更新エラー:", error);
            const errorMessage = (error as any)?.response?.data?.message || "スキル情報の更新に失敗しました。";
            toast({ title: "エラー", description: errorMessage, variant: "destructive" });
            // エラー発生時はサーバーの状態に戻すためにキャッシュを無効化
            queryClient.invalidateQueries({ queryKey: ['myProfile'] });
            queryClient.invalidateQueries({ queryKey: ['myEducations'] }); // スキルも取得し直す
        }
    });

        // ★ ポートフォリオ CRUD Mutation を追加
    const createPortfolioItemMutation = useMutation<PortfolioItem, Error, PortfolioFormData, unknown>({
        mutationFn: createPortfolioItem,
        onSuccess: (newItem) => {
            // キャッシュ更新: 新しいデータをリストの先頭に追加 (または末尾に追加)
            // ユーザーが追加したものをすぐに見たい場合は先頭、時系列順なら末尾が良い場合も
            queryClient.setQueryData<PortfolioItem[]>(['myPortfolioItems'], (oldData = []) => [newItem, ...oldData]);
            setIsPortfolioDialogOpen(false); // ダイアログを閉じる
            toast({ title: "成功", description: "ポートフォリオが追加されました。" });
        },
        onError: (error) => {
             console.error("ポートフォリオ追加エラー:", error);
             // エラーレスポンスから詳細を取得できる場合
             const errorMessage = (error as any)?.response?.data?.message || "ポートフォリオの追加に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
             // ダイアログは閉じずにエラーを表示する (ユーザーが再試行できるように)
             // setIsPortfolioDialogOpen(false);
        }
    });
    const updatePortfolioItemMutation = useMutation<PortfolioItem, Error, { id: number; data: PortfolioFormData }, unknown>({
        mutationFn: updatePortfolioItem,
        onSuccess: (updatedItem) => {
             // キャッシュ更新: 更新されたデータでリストを置き換え
            queryClient.setQueryData<PortfolioItem[]>(['myPortfolioItems'], (oldData = []) =>
                oldData.map(item => item.id === updatedItem.id ? updatedItem : item)
            );
            setIsPortfolioDialogOpen(false); // ダイアログを閉じる
            setEditingPortfolioItem(null);      // 編集対象をリセット
            toast({ title: "成功", description: "ポートフォリオが更新されました。" });
        },
         onError: (error) => {
             console.error("ポートフォリオ更新エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "ポートフォリオの更新に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
             // 更新失敗時もダイアログは閉じない方が良い場合がある
             // setIsPortfolioDialogOpen(false);
             // setEditingPortfolioItem(null);
        }
    });
    const deletePortfolioItemMutation = useMutation<void, Error, number, unknown>({
        mutationFn: deletePortfolioItem,
        onSuccess: (_, deletedId) => { // 第2引数で削除IDを受け取る
            // キャッシュ更新: 削除されたデータをリストから除外
            queryClient.setQueryData<PortfolioItem[]>(['myPortfolioItems'], (oldData = []) =>
                oldData.filter(item => item.id !== deletedId)
            );
            setIsDeletePortfolioDialogOpen(false); // 削除確認ダイアログを閉じる
            setDeletingPortfolioItemId(null); // 削除対象IDをリセット
            toast({ title: "成功", description: "ポートフォリオが削除されました。" });
        },
        onError: (error) => {
             console.error("ポートフォリオ削除エラー:", error);
             const errorMessage = (error as any)?.response?.data?.message || "ポートフォリオの削除に失敗しました。";
             toast({ title: "エラー", description: errorMessage, variant: "destructive" });
             setIsDeletePortfolioDialogOpen(false); // エラー時も確認ダイアログは閉じる
             setDeletingPortfolioItemId(null);
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

    // ★ スキル入力変更ハンドラ
    const handleSkillInputChange = (newValue: string, actionMeta: any) => {
        if (actionMeta.action === 'input-change') {
            setSkillInputValue(newValue);
        }
    };

    // ★ スキル追加ボタンハンドラ
    const handleAddNewSkill = () => {
        setEditingSkill(null); // 新規モード
        setSkillInputValue(''); // 検索入力クリア
        setIsSkillDialogOpen(true);
    };

    // ★ スキル編集ボタンハンドラ
    const handleEditSkill = (skill: UserSkill) => {
        setEditingSkill(skill); // 編集対象を設定
        setSkillInputValue(''); // 検索入力クリア
        setIsSkillDialogOpen(true);
    };

    // ★ スキル削除ボタンハンドラ
    const handleDeleteSkillClick = (id: number) => {
        setDeletingSkillId(id);
        setIsDeleteSkillDialogOpen(true);
    };

    // ★ スキル削除確定ハンドラ
     const confirmDeleteSkill = () => {
        if (deletingSkillId === null) return;
        // managedSkills から対象を除いたリストを作成
        const updatedSkillList = managedSkills
            .filter(skill => skill.id !== deletingSkillId)
            .map(skill => ({ // API 送信形式に変換
                skill_id: skill.id,
                level: skill.user_details?.level ?? null,
                years_of_experience: skill.user_details?.years_of_experience ?? null,
                description: skill.user_details?.description ?? null,
            }));
        // 一括更新 API を呼び出し
        updateSkillsMutation.mutate(updatedSkillList);
    };

    // ★ スキル保存ハンドラ (ダイアログから呼び出される)
    const handleSaveSkill = (formData: SkillFormData) => {
        if (!formData.skill) { // スキルが選択されていない場合 (基本ないはず)
            toast({ title: "エラー", description: "スキルを選択してください。", variant: "destructive" });
            return;
        }

        const isEditing = editingSkill !== null; // 編集モードか判定

        // API 送信用のデータを作成
        const skillDataToSave = {
            skill_id: formData.skill.id,
            level: formData.level ?? null,
            years_of_experience: formData.years_of_experience ?? null,
            description: formData.description ?? null,
        };

        let updatedSkillList;
        if (isEditing) {
            // 編集: managedSkills 内の該当スキルを更新
            updatedSkillList = managedSkills.map(skill =>
                skill.id === editingSkill.id ? skillDataToSave : {
                    skill_id: skill.id,
                    level: skill.user_details?.level ?? null,
                    years_of_experience: skill.user_details?.years_of_experience ?? null,
                    description: skill.user_details?.description ?? null,
                }
            );
        } else {
            // 新規追加: managedSkills に新しいスキルを追加
             // 重複チェック (念のため)
             if (managedSkills.some(s => s.id === skillDataToSave.skill_id)) {
                 toast({ title: "情報", description: "このスキルは既に追加されています。", variant: "default" });
                 setIsSkillDialogOpen(false); // ダイアログ閉じる
                 return;
             }
            updatedSkillList = [
                ...managedSkills.map(skill => ({
                    skill_id: skill.id,
                    level: skill.user_details?.level ?? null,
                    years_of_experience: skill.user_details?.years_of_experience ?? null,
                    description: skill.user_details?.description ?? null,
                })),
                skillDataToSave // 新しいスキルを追加
            ];
        }

        // スキル一括更新 API を呼び出し
        updateSkillsMutation.mutate(updatedSkillList);
    };

    // ★ ポートフォリオ用ボタンハンドラを追加
    const handleAddNewPortfolioItem = () => {
        setEditingPortfolioItem(null);
        setIsPortfolioDialogOpen(true);
    };
    const handleEditPortfolioItem = (item: PortfolioItem) => {
        setEditingPortfolioItem(item);
        setIsPortfolioDialogOpen(true);
    };
    const handleDeletePortfolioItemClick = (id: number) => {
        setDeletingPortfolioItemId(id);
        setIsDeletePortfolioDialogOpen(true);
    };
     const confirmDeletePortfolioItem = () => {
        if (deletingPortfolioItemId) {
            deletePortfolioItemMutation.mutate(deletingPortfolioItemId);
        }
    };
    // ★ ポートフォリオ保存ハンドラ (ダイアログから呼び出される)
    const handleSavePortfolioItem = (formData: PortfolioFormData) => {
        if (editingPortfolioItem) { // 編集
            updatePortfolioItemMutation.mutate({ id: editingPortfolioItem.id, data: formData });
        } else { // 新規作成
            createPortfolioItemMutation.mutate(formData);
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
    if (isLoadingProfile || isLoadingMetadata || isLoadingExperiences || isLoadingEducations || isLoadingPortfolio) {
         return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }
    // ★ データ取得エラー表示を統合
    if (profileError || metadataError || experiencesError || educationsError || portfolioError || !currentProfile || !metadata) {
         const errorMsg = profileError?.message || metadataError?.message || experiencesError?.message || educationsError?.message || portfolioError?.message || 'データの取得に失敗しました。';
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

             {/* --- スキルセクション 更新 --- */}
             <Card className="mt-6">
                <CardHeader>
                    <div>
                    <CardTitle className="flex items-center"><Lightbulb className="h-5 w-5 mr-2 text-primary"/>スキル</CardTitle>
                    <CardDescription>あなたの専門知識や技術、語学力などを登録してください。</CardDescription>
                    </div>
                    {/* ★ 新規追加ボタン (ダイアログを開く) */}
                     <Button variant="outline" size="sm" onClick={handleAddNewSkill}>
                         <Plus className="h-4 w-4 mr-2" />
                         新規追加
                     </Button>
                </CardHeader>
                <CardContent>
                    {/* ★ 登録済みスキル一覧のみ表示 */}
                    {managedSkills.length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(
                                managedSkills.reduce((acc, skill) => {
                                    const typeKey = skill.type || 'その他';
                                    if (!acc[typeKey]) acc[typeKey] = [];
                                    acc[typeKey].push(skill);
                                    return acc;
                                }, {} as Record<string, UserSkill[]>)
                            ).map(([type, skillsOfType]) => (
                                <div key={type}>
                                    <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                                        {metadata?.skill_types[type] || type}
                                    </h3>
                                    <div className="space-y-4">
                                        {skillsOfType.map(skill => (
                                            // ★ SkillItem は表示のみで編集機能は不要に (編集はダイアログから)
                                            <div key={skill.id} className="border rounded-md p-4 relative bg-card/50">
                                                 {/* 削除・編集ボタン */}
                                                <div className="absolute top-2 right-2 flex space-x-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditSkill(skill)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteSkillClick(skill.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                 {/* スキル名 */}
                                                 <Badge variant="secondary" className="text-base font-semibold px-3 py-1 mb-2">
                                                    {skill.name}
                                                 </Badge>
                                                  {/* レベル・経験年数・説明表示 */}
                                                 <div className="space-y-1 text-sm text-muted-foreground">
                                                      {skill.user_details?.level_label && (
                                                         <div className="flex items-center"><Star className="h-3.5 w-3.5 mr-1.5 text-yellow-500 fill-current"/> {skill.user_details.level_label}</div>
                                                      )}
                                                      {skill.user_details?.years_of_experience !== null && skill.user_details?.years_of_experience !== undefined && (
                                                         <div className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1.5"/> {skill.user_details.years_of_experience} 年</div>
                                                      )}
                                                      {skill.user_details?.description && (
                                                         <p className="pt-1 text-xs whitespace-pre-wrap">{skill.user_details.description}</p>
                                                      )}
                                                 </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic text-center py-4">
                            スキルはまだ登録されていません。「新規追加」ボタンから登録できます。
                        </p>
                    )}
                </CardContent>
             </Card>

             {/* --- ポートフォリオセクション --- ★ 追加 ★ */}
             <Card className="mt-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center"><BookOpen className="h-5 w-5 mr-2 text-primary"/>ポートフォリオ</CardTitle>
                        <CardDescription>作成した作品やプロジェクト実績などを登録してください。</CardDescription>
                    </div>
                     <Button variant="outline" size="sm" onClick={handleAddNewPortfolioItem}>
                         <Plus className="h-4 w-4 mr-2" />
                         新規追加
                     </Button>
                </CardHeader>
                <CardContent>
                    {/* ★ ポートフォリオリスト表示 */}
                    {portfolioItems && portfolioItems.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4"> {/* 1列表示 */}
                            {portfolioItems.map(item => (
                                <Card key={item.id} className="flex flex-col sm:flex-row"> {/* 横並びにする */}
                                     {/* TODO: v1.1 サムネイル表示 */}
                                     {/* <img src={item.thumbnail_url ?? '/placeholder.png'} alt={item.title} className="w-full sm:w-32 h-32 sm:h-auto object-cover flex-shrink-0"/> */}
                                    <div className="flex-grow p-4 flex flex-col justify-between">
                                         <div>
                                             <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                                             {item.url && (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center break-all mb-2">
                                                    <LinkIcon className="h-3 w-3 mr-1 flex-shrink-0"/><span>{item.url}</span> <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0 opacity-70" />
                                                </a>
                                             )}
                                             {item.description && (
                                                 <p className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none">{item.description}</p>
                                             )}
                                         </div>
                                          {/* ★ 編集・削除ボタン */}
                                         <div className="flex space-x-2 mt-3 self-end">
                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditPortfolioItem(item)}>
                                                 <Edit className="h-4 w-4" />
                                             </Button>
                                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeletePortfolioItemClick(item.id)}>
                                                 <Trash2 className="h-4 w-4" />
                                             </Button>
                                         </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                     ) : (
                         <p className="text-muted-foreground italic text-center py-4">
                             ポートフォリオはまだ登録されていません。「新規追加」ボタンから登録できます。
                         </p>
                     )}
                </CardContent>
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

            {/* ★ SkillDialog をレンダリング */}
            {metadata && (
                 <SkillDialog
                    isOpen={isSkillDialogOpen}
                    setIsOpen={setIsSkillDialogOpen}
                    editingSkill={editingSkill}
                    metadata={metadata}
                    onSave={handleSaveSkill} // 保存ハンドラ
                    isSaving={updateSkillsMutation.isPending} // 保存中フラグ
                    currentSkillIds={managedSkills.map(s => s.id)} // 既存スキルID
                    skillInputValue={skillInputValue} // 検索入力値
                    onSkillInputChange={handleSkillInputChange} // 入力変更ハンドラ
                 />
            )}

            {/* ★ PortfolioDialog をレンダリング */}
            <PortfolioDialog
                isOpen={isPortfolioDialogOpen}
                setIsOpen={setIsPortfolioDialogOpen}
                editingPortfolioItem={editingPortfolioItem}
                onSave={handleSavePortfolioItem}
                isSaving={createPortfolioItemMutation.isPending || updatePortfolioItemMutation.isPending} // 保存中フラグ
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

            {/* ★ スキル削除確認 AlertDialog */}
             <AlertDialog open={isDeleteSkillDialogOpen} onOpenChange={setIsDeleteSkillDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>削除確認</AlertDialogTitle>
                    <AlertDialogDescription>
                        このスキルをリストから削除してもよろしいですか？
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingSkillId(null)}>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                         onClick={confirmDeleteSkill} // 変更
                         disabled={updateSkillsMutation.isPending} // スキル更新Mutationを見る
                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {updateSkillsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        削除する
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ★ ポートフォリオ削除確認 AlertDialog をレンダリング */}
             <AlertDialog open={isDeletePortfolioDialogOpen} onOpenChange={setIsDeletePortfolioDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>削除確認</AlertDialogTitle>
                    <AlertDialogDescription>
                        このポートフォリオ項目を削除してもよろしいですか？この操作は元に戻せません。
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingPortfolioItemId(null)}>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                         onClick={confirmDeletePortfolioItem}
                         disabled={deletePortfolioItemMutation.isPending}
                         className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {deletePortfolioItemMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        削除する
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}

export default ProfileEditPage;