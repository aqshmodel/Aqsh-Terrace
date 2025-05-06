// frontend/src/components/dialogs/SkillDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserSkill } from '@/types/user';
import { SkillForm, SkillFormData } from '@/components/forms/SkillForm';
// ★ UseMutationResult は不要 (保存処理は ProfileEditPage に集約)

// --- コンポーネント Props ---
interface SkillDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    editingSkill: UserSkill | null; // 編集対象データ (新規なら null)
    metadata: { // フォームに渡すメタデータ
        skill_levels: Record<string, string>;
    };
    // ★ 保存処理用の関数を受け取る
    onSave: (data: SkillFormData) => void;
    isSaving: boolean; // 保存中フラグ
    // ★ 検索用 state とハンドラ
    currentSkillIds: number[];
    skillInputValue: string;
    onSkillInputChange: (newValue: string, actionMeta: any) => void;
}

// --- ダイアログコンポーネント ---
export function SkillDialog({
    isOpen,
    setIsOpen,
    editingSkill,
    metadata,
    onSave,
    isSaving,
    currentSkillIds,
    skillInputValue,
    onSkillInputChange,
}: SkillDialogProps) {

    const isEditMode = !!editingSkill;

    // フォーム送信時の処理 (親コンポーネントの onSave を呼ぶだけ)
    const handleFormSubmit = (data: SkillFormData) => {
        onSave(data);
        // ダイアログを閉じる処理は onSave の成功/失敗に応じて ProfileEditPage 側で行う
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'スキルを編集' : 'スキルを追加'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'スキルのレベルや経験年数などを編集します。' : '新しいスキルを追加し、詳細を入力します。'}
                    </DialogDescription>
                </DialogHeader>
                {/* スキルフォームをレンダリング */}
                <SkillForm
                    initialData={editingSkill}
                    metadata={metadata}
                    onSubmit={handleFormSubmit}
                    isPending={isSaving} // 保存中フラグを渡す
                    isEditMode={isEditMode} // 編集モードフラグを渡す
                    currentSkillIds={currentSkillIds} // 既存スキルIDリストを渡す
                    skillInputValue={skillInputValue} // 検索入力値を渡す
                    onSkillInputChange={onSkillInputChange} // 入力変更ハンドラを渡す
                />
            </DialogContent>
        </Dialog>
    );
}