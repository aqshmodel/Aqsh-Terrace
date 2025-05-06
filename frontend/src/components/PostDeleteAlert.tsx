// src/components/PostDeleteAlert.tsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom'; // 削除後のリダイレクト用

import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import apiClient from '@/lib/apiClient';

interface PostDeleteAlertProps {
  postId: number; // 削除対象の投稿 ID
  onDeleted?: () => void; // 削除成功時のコールバック (任意)
}

export function PostDeleteAlert({ postId, onDeleted }: PostDeleteAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: () => {
      // ★ DELETE リクエストで削除 API を呼び出す ★
      return apiClient.delete(`/api/posts/${postId}`);
    },
    onSuccess: () => {
      console.log("投稿削除成功:", postId);
      setApiError(null);
      setIsOpen(false);
      // ★ 投稿一覧と詳細のキャッシュを無効化 ★
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      alert("投稿を削除しました！");
      onDeleted?.(); // コールバック実行 (例: 詳細ページから一覧へ戻るなど)
      // navigate('/'); // 必要ならここでリダイレクト
    },
    onError: (error: any) => {
       console.error("投稿削除エラー:", error);
       if (error.response && (error.response.status === 401 || error.response.status === 403)) {
         setApiError("投稿を削除する権限がありません。");
       } else {
         setApiError("削除中にエラーが発生しました。");
       }
       // エラー時はダイアログを閉じない方が良いかもしれない
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は元に戻せません。投稿を完全に削除します。
             {apiError && <p className="text-sm font-medium text-destructive mt-2">{apiError}</p>}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>キャンセル</AlertDialogCancel>
          {/* 削除実行ボタン */}
          <AlertDialogAction onClick={handleDelete} disabled={mutation.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {mutation.isPending ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
  );
}