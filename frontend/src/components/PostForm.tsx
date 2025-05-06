// src/components/PostForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { KeyboardEvent } from 'react'; // ★ KeyboardEvent 型をインポート ★

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; // ★ ローディングアイコンをインポート ★
import { postSchema, PostFormValues } from "@/lib/validators/postValidators";
import apiClient from "@/lib/apiClient";
import axios from "axios"; // AxiosError 型ガード用

export function PostForm() {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      body: "",
    },
    // ★ mode: 'onChange' を追加して入力中にバリデーション (任意) ★
    mode: 'onChange',
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newPost: PostFormValues) => {
      return apiClient.post('/api/posts', newPost);
    },
    onSuccess: () => {
      console.log("投稿成功！");
      setApiError(null);
      form.reset();
      // ★ 投稿一覧のキャッシュを無効化 ★
      // 'posts' だけでなく、ページネーションを含むキー ['posts', page] も考慮するなら
      // queryClient.invalidateQueries({ queryKey: ['posts'] }) は prefix マッチするのでこれだけで良いはず
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // alert("投稿しました！"); // 必要に応じて Toast などに置き換え検討
    },
    onError: (error: unknown) => { // エラーの型を unknown に
      console.error("投稿エラー:", error);
      setApiError(null); // Reset previous errors
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 422 && error.response.data.errors) {
          const validationErrors = error.response.data.errors;
          Object.entries(validationErrors).forEach(([field, messages]) => {
            if (field === 'body' && Array.isArray(messages) && messages.length > 0) {
              form.setError('body', { type: 'server', message: messages[0] });
            }
          });
          if (!form.formState.errors.body) {
             setApiError("入力内容を確認してください。");
          }
        } else if (error.response.status === 401 || error.response.status === 403) {
           setApiError("投稿するにはログインが必要です。");
        } else {
           setApiError(`投稿中にエラーが発生しました (${error.response.status})。`);
        }
      } else {
        setApiError("投稿中に不明なエラーが発生しました。");
      }
    },
  });

  function onSubmit(values: PostFormValues) {
    setApiError(null);
    mutation.mutate(values);
  }

  // ★★★ Enter キーでの改行処理 (CommentForm と同様) ★★★
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Enter単独での送信を防止
    }
  };

  return (
    <Form {...form}>
      {/* ★ noValidate を追加 */}
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4 border p-4 rounded-md shadow-sm bg-card"> {/* 背景と枠を追加 */}
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>新規投稿</FormLabel> {/* ラベルを少し変更 */}
              <FormControl>
                 {/* ★★★ onKeyDown ハンドラを追加 ★★★ */}
                <Textarea
                  placeholder="いまどうしてる？"
                  className="resize-none min-h-[80px]" // 最小高さを設定
                  {...field}
                  onKeyDown={handleKeyDown} // ★ onKeyDown を追加 ★
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apiError && (
          <p className="text-sm font-medium text-destructive">{apiError}</p>
        )}

        {/* ★ ボタンを右寄せし、ローディング表示を追加 ★ */}
        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending || !form.formState.isValid || !form.formState.isDirty}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                投稿中...
              </>
            ) : (
              "投稿する"
            )}
          </Button>
        </div>
        {/* ★★★ ここまで変更 ★★★ */}
      </form>
    </Form>
  );
}