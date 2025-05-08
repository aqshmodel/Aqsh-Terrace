// src/components/PostDeleteAlert.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import apiClient from '@/lib/apiClient';

interface PostDeleteAlertProps {
  postId: number; // 削除対象の投稿 ID
  onDeleted?: () => void; // 削除成功時のコールバック (任意)
  triggerButtonText?: string; // トリガーボタンのテキスト (任意)
  triggerButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null | undefined; // トリガーボタンのバリアント (任意)
}

export function PostDeleteAlert({
  postId,
  onDeleted,
  triggerButtonText = "削除", // デフォルトのトリガーボタンテキスト
  triggerButtonVariant = "destructive", // デフォルトのトリガーボタンバリアント
}: PostDeleteAlertProps) {
  const [isOpen, setIsOpen] = useState(false); // ★ AlertDialog の open/onOpenChange に使用 ★
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      return apiClient.delete(`/api/posts/${postId}`);
    },
    onSuccess: () => {
      console.log("投稿削除成功:", postId);
      setApiError(null);
      setIsOpen(false); // ★ 成功時にダイアログを閉じる ★
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      alert("投稿を削除しました！");
      onDeleted?.();
      // navigate('/'); // 必要ならここでリダイレクト
    },
    onError: (error: any) => {
       console.error("投稿削除エラー:", error);
       if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         setApiError("投稿を削除する権限がありません。");
       } else {
         setApiError("削除中にエラーが発生しました。");
       }
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    // ★ AlertDialog で全体をラップし、open と onOpenChange を設定 ★
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* ★ ダイアログを開くためのトリガー ★ */}
      <AlertDialogTrigger asChild>
        <Button variant={triggerButtonVariant}>{triggerButtonText}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は元に戻せません。投稿を完全に削除します。
             {apiError && <p className="text-sm font-medium text-destructive mt-2">{apiError}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* AlertDialogCancel はクリックされると onOpenChange(false) をトリガーします */}
          <AlertDialogCancel disabled={mutation.isPending}>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={mutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {mutation.isPending ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}