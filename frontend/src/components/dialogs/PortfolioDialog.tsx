// frontend/src/components/dialogs/PortfolioDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PortfolioItem } from '@/types/user';
import { PortfolioForm, PortfolioFormData } from '@/components/forms/PortfolioForm';

// --- コンポーネント Props ---
interface PortfolioDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    editingPortfolioItem: PortfolioItem | null; // 編集対象データ
    // ★ 保存処理用の関数を受け取る
    onSave: (data: PortfolioFormData) => void;
    isSaving: boolean; // 保存中フラグ
}

// --- ダイアログコンポーネント ---
export function PortfolioDialog({
    isOpen,
    setIsOpen,
    editingPortfolioItem,
    onSave,
    isSaving,
}: PortfolioDialogProps) {

    const isEditMode = !!editingPortfolioItem;

    const handleFormSubmit = (data: PortfolioFormData) => {
        onSave(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'ポートフォリオを編集' : 'ポートフォリオを追加'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'ポートフォリオの詳細を編集します。' : '新しいポートフォリオを追加します。'}
                    </DialogDescription>
                </DialogHeader>
                <PortfolioForm
                    initialData={editingPortfolioItem}
                    onSubmit={handleFormSubmit}
                    isPending={isSaving}
                />
            </DialogContent>
        </Dialog>
    );
}