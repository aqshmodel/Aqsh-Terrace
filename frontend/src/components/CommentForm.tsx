// src/components/CommentForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from "react";
import type { KeyboardEvent } from 'react';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // FormLabel もインポート
import { Textarea } from "@/components/ui/textarea";
import { commentSchema, CommentFormValues } from "@/lib/validators/commentValidators";
import apiClient from "@/lib/apiClient";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface CommentFormProps {
  postId: number;
  onCommentSubmit?: () => void; // フォームリセットなどのためのコールバック (任意)
}

export function CommentForm({ postId, onCommentSubmit }: CommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "" },
    mode: 'onChange', // 入力中にバリデーションを行う (isValid のため)
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newComment: CommentFormValues): Promise<any> => { // 戻り値の型を any に (使わないので)
      // サーバーにコメントデータを送信
      const response = await apiClient.post(`/api/posts/${postId}/comments`, newComment);
      return response.data; // 成功レスポンスを返す
    },
    onSuccess: (data, variables) => { // 成功時の処理
      console.log("Comment posted successfully!", { data, variables });
      setApiError(null); // APIエラー表示をクリア
      form.reset(); // フォームの内容をリセット

      // ★★★ キャッシュ無効化: 該当投稿のコメント一覧を再取得させる ★★★
      // クエリキーは CommentList で使用しているものと一致させる必要がある
      // ['comments', postId.toString()] のプレフィックスで関連クエリを無効化
      queryClient.invalidateQueries({ queryKey: ['comments', postId.toString()] });
      console.log(`Invalidated queries with key prefix: ['comments', '${postId.toString()}']`);

      // ★★★ (代替案/追加検討) キャッシュの直接更新 (より即時反映) ★★★
      // invalidateQueries の代わりに、または併用してキャッシュを直接更新することも可能
      // queryClient.setQueryData<PaginatedCommentsResponse>(['comments', postId.toString(), 1], (oldData) => {
      //   if (!oldData) return oldData;
      //   // 新しいコメントをリストの先頭に追加するロジック (ページネーション考慮が必要)
      //   // 例: const newCommentData = { ...data, user: loggedInUser }; // data にユーザー情報がない場合
      //   // return {
      //   //   ...oldData,
      //   //   data: [newCommentData, ...oldData.data],
      //   //   meta: { ...oldData.meta, total: oldData.meta.total + 1 }
      //   // };
      // });

      // 親コンポーネントに通知（任意）
      if (onCommentSubmit) {
        onCommentSubmit();
      }
    },
    onError: (error: unknown) => { // エラー時の処理
      console.error("Comment post error:", error);
      setApiError(null); // 前のエラーをクリア

      // Axios エラーかどうか判定
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        // バリデーションエラー (422)
        if (status === 422 && data.errors) {
          const validationErrors = data.errors as Record<string, string[]>;
          Object.entries(validationErrors).forEach(([field, messages]) => {
            if (field === 'body' && messages.length > 0) {
              // react-hook-form の setError を使ってフィールドにエラーメッセージを設定
              form.setError('body', { type: 'server', message: messages[0] });
            }
          });
          // body 以外のエラーや一般的なメッセージ
          if (!form.formState.errors.body) {
             setApiError("入力内容を確認してください。");
          }
        } else if (status === 401 || status === 403) {
           setApiError("コメントを投稿する権限がありません。ログイン状態を確認してください。");
        } else {
           // その他のサーバーエラー
           setApiError(`コメントの投稿中にエラーが発生しました (コード: ${status})。`);
        }
      } else {
        // Axios 以外のエラー (ネットワークエラーなど)
        setApiError("コメントの投稿中に不明なエラーが発生しました。ネットワーク接続を確認してください。");
      }
    },
  });

  // フォーム送信処理
  function onSubmit(values: CommentFormValues) {
    setApiError(null); // 送信前にエラーをクリア
    console.log("Submitting comment:", values);
    mutation.mutate(values); // Mutation を実行
  }

  // Enter キーでの改行制御
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter キー単独で押された場合
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // ★ デフォルトの改行/送信動作をキャンセル
      // ★ Enter 単独では送信しない ★
      console.log("Enter pressed without Shift, preventing submission.");
    }
    // Shift + Enter は通常の改行動作（デフォルト）
  };

  return (
    // Form コンポーネントで useForm のインスタンスをラップ
    <Form {...form}>
      {/* form タグに onSubmit と noValidate を設定 */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3 mt-4 border-t pt-4"> {/* 区切り線とスペースを追加 */}
        {/* body フィールド */}
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">コメント本文</FormLabel> {/* スクリーンリーダー向けラベル */}
              <FormControl>
                <Textarea
                  placeholder="コメントを入力してください..."
                  rows={3} // 表示行数を指定
                  onKeyDown={handleKeyDown} // Enter キー処理
                  {...field} // react-hook-form のフィールドプロパティを展開
                  aria-invalid={!!form.formState.errors.body} // エラー時に aria-invalid を設定
                />
              </FormControl>
              {/* バリデーションエラーメッセージ表示 */}
              <FormMessage />
            </FormItem>
          )}
        />
        {/* API エラー表示 */}
        {apiError && (
          <p className="text-sm font-medium text-destructive">{apiError}</p>
        )}
        {/* 送信ボタン */}
        <div className="flex justify-end">
            <Button
                type="submit"
                size="sm"
                // Mutation 実行中、またはフォームが無効 or 未変更の場合は無効化
                disabled={mutation.isPending || !form.formState.isValid || !form.formState.isDirty}
                aria-busy={mutation.isPending} // ローディング状態を伝える
            >
                {mutation.isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        投稿中...
                    </>
                ) : (
                    "コメント投稿"
                )}
            </Button>
        </div>
      </form>
    </Form>
  );
}