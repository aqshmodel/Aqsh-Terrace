// frontend/src/components/dialogs/ExperienceDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // Trigger は親コンポーネントで制御
} from "@/components/ui/dialog";
import { Experience } from '@/types/user';
import { ExperienceForm, ExperienceFormData } from '@/components/forms/ExperienceForm';
import { UseMutationResult } from '@tanstack/react-query'; // Mutation の型

// --- コンポーネント Props ---
interface ExperienceDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    editingExperience: Experience | null; // 編集対象データ (新規なら null)
    metadata: { // フォームに渡すメタデータ
        industries: Record<string, string>;
        company_sizes: Record<string, string>;
    };
    // ★ 作成・更新用の Mutation オブジェクトを受け取る
    createMutation: UseMutationResult<Experience, Error, ExperienceFormData, unknown>;
    updateMutation: UseMutationResult<Experience, Error, { id: number; data: ExperienceFormData }, unknown>; // id も必要
}

// --- ダイアログコンポーネント ---
export function ExperienceDialog({
    isOpen,
    setIsOpen,
    editingExperience,
    metadata,
    createMutation,
    updateMutation
}: ExperienceDialogProps) {

    const isEdit = !!editingExperience; // 編集モードかどうか
    const mutation = isEdit ? updateMutation : createMutation; // 使用する Mutation を決定

    // フォーム送信時の処理
    const handleFormSubmit = (data: ExperienceFormData) => {
        if (isEdit && editingExperience) {
            // 更新 Mutation を実行 (id とデータを渡す)
            updateMutation.mutate({ id: editingExperience.id, data });
        } else {
            // 作成 Mutation を実行
            createMutation.mutate(data);
        }
        // TODO: Mutation の onSuccess でダイアログを閉じるようにする (ProfileEditPage側で実装)
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[1200px]"> {/* 幅を少し広げる */}
                <DialogHeader>
                    <DialogTitle>{isEdit ? '職務経歴を編集' : '職務経歴を追加'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? '職務経歴の詳細を編集します。' : '新しい職務経歴を追加します。'}
                    </DialogDescription>
                </DialogHeader>
                {/* フォームコンポーネントをレンダリング */}
                <ExperienceForm
                    initialData={editingExperience}
                    metadata={metadata}
                    onSubmit={handleFormSubmit}
                    isPending={mutation.isPending} // 対応する Mutation のローディング状態
                />
            </DialogContent>
        </Dialog>
    );
}