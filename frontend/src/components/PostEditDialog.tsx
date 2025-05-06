// src/components/PostEditDialog.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react"; // useEffect をインポート
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Post } from '@/types/post';
import type { KeyboardEvent } from 'react'; // ★ KeyboardEvent 型をインポート ★

import { Button } from "@/components/ui/button";
import {
  // DialogTrigger は外から渡されるので不要
  DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react"; // ★ ローディングアイコンをインポート ★
import { postSchema, PostFormValues } from "@/lib/validators/postValidators";
import apiClient from "@/lib/apiClient";
import axios from "axios";

interface PostEditDialogProps {
  post: Post;
  // ★ ダイアログを閉じるための関数を受け取る (オプション) ★
  // これにより mutation 成功時に確実にダイアログを閉じれる
  // setIsOpen?: (isOpen: boolean) => void;
}

// ★ isOpen は外部から制御されることが多いので、内部状態ではなく props で受け取るか、
//    または外部の Dialog コンポーネントの open/onOpenChange を使う想定にする。
//    ここでは内部状態は持たない前提で進める。
export function PostEditDialog({ post /*, setIsOpen */ }: PostEditDialogProps) {
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      body: post.body || "",
    },
    // ★ mode: 'onChange' を追加 ★
    mode: 'onChange',
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // ★ Props の post が変更されたらフォームの値をリセットする (ダイアログ再利用時のため) ★
  useEffect(() => {
    form.reset({ body: post.body || "" });
    setApiError(null); // エラーもリセット
  }, [post, form.reset]);

  const mutation = useMutation({
    mutationFn: (updatedPost: PostFormValues) => {
      // ★ API エンドポイントを確認 (PUT or PATCH) ★
      return apiClient.put(`/api/posts/${post.id}`, updatedPost);
    },
    onSuccess: (data) => {
      console.log("投稿更新成功:", data);
      setApiError(null);
      // ダイアログを閉じる処理 (外部から制御)
      // setIsOpen?.(false); // Props で受け取った関数を呼ぶ
      // ★ キャッシュ無効化 ★
      // Promise.all で並列実行も可能
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', post.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', post.user.id.toString()] }); // ★ プロフィールページの投稿一覧も更新 ★
      // alert("投稿を更新しました！"); // Toast などに置き換え推奨
      // フォームのリセットは useEffect で行われるので不要かも
      // form.reset({ body: data?.data?.body ?? post.body }); // 更新後のデータでリセットする場合
    },
    onError: (error: unknown) => { // ★ 型を unknown に ★
      console.error("投稿更新エラー:", error);
      setApiError(null); // Reset
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
           setApiError("投稿を編集する権限がありません。");
        } else {
           setApiError(`更新中にエラーが発生しました (${error.response.status})。`);
        }
      } else {
        setApiError("更新中に不明なエラーが発生しました。");
      }
    },
  });

  function onSubmit(values: PostFormValues) {
    // 変更がない場合は送信しない (任意)
    // if (!form.formState.isDirty) {
    //   setIsOpen?.(false); // そのまま閉じる
    //   return;
    // }
    setApiError(null);
    mutation.mutate(values);
  }

  // ★★★ Enter キーでの改行処理 ★★★
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
    }
  };

  return (
      // ★ DialogTrigger は外部にあるので、DialogContent から開始 ★
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>投稿を編集</DialogTitle>
          <DialogDescription>
            内容を編集して保存してください。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          {/* ★ noValidate を追加 */}
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>投稿内容</FormLabel>
                  <FormControl>
                     {/* ★★★ onKeyDown ハンドラを追加 ★★★ */}
                    <Textarea
                      placeholder="内容を入力..."
                      className="min-h-[100px]"
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
             <DialogFooter>
               {/* DialogClose でフォーム送信せずに閉じる */}
               <DialogClose asChild>
                   <Button type="button" variant="outline">キャンセル</Button>
               </DialogClose>
                {/* ★★★ 送信ボタンのローディング表示 ★★★ */}
               <Button type="submit" disabled={mutation.isPending || !form.formState.isValid || !form.formState.isDirty}>
                   {mutation.isPending ? (
                       <>
                           <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                           保存中...
                       </>
                   ) : (
                       "保存"
                   )}
               </Button>
               {/* ★★★ ここまで変更 ★★★ */}
             </DialogFooter>
          </form>
        </Form>
      </DialogContent>
  );
}