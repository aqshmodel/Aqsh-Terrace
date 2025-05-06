// frontend/src/components/dialogs/EducationDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Education } from '@/types/user';
import { EducationForm, EducationFormData } from '@/components/forms/EducationForm';
import { UseMutationResult } from '@tanstack/react-query';

// --- コンポーネント Props ---
interface EducationDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    editingEducation: Education | null; // 編集対象データ
    // 作成・更新用の Mutation オブジェクトを受け取る
    createMutation: UseMutationResult<Education, Error, EducationFormData, unknown>;
    updateMutation: UseMutationResult<Education, Error, { id: number; data: EducationFormData }, unknown>;
}

// --- ダイアログコンポーネント ---
export function EducationDialog({
    isOpen,
    setIsOpen,
    editingEducation,
    createMutation,
    updateMutation
}: EducationDialogProps) {

    const isEdit = !!editingEducation;
    const mutation = isEdit ? updateMutation : createMutation;

    const handleFormSubmit = (data: EducationFormData) => {
        if (isEdit && editingEducation) {
            updateMutation.mutate({ id: editingEducation.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[1200px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? '学歴を編集' : '学歴を追加'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? '学歴の詳細を編集します。' : '新しい学歴を追加します。'}
                    </DialogDescription>
                </DialogHeader>
                <EducationForm
                    initialData={editingEducation}
                    onSubmit={handleFormSubmit}
                    isPending={mutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
}