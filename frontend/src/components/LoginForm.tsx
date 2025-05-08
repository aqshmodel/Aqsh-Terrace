// src/components/LoginForm.tsx (修正後)
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginFormValues } from "@/lib/validators/authValidators";
import apiClient from "@/lib/apiClient";
import useAuthStore from "@/stores/authStore";
// ★ UserData 型をインポート (または User 型があればそちらを使う)
import type { UserData } from '@/stores/authStore';

export function LoginForm() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginAction = useAuthStore((state) => state.login);
  const [apiError, setApiError] = useState<string | null>(null);

  async function onSubmit(values: LoginFormValues) {
    setApiError(null);
    // ★ isSubmitting を使う場合、Mutation を使う方が状態管理が楽
    // form.formState.isSubmitting = true; // これは react-hook-form の管理下

    try {
      await apiClient.post('/api/login', values);
      console.log("ログインAPI呼び出し成功、ユーザー情報取得処理へ...");

      try {
        // ★ /api/user のレスポンス型を明示的に指定
        const response = await apiClient.get<{ data: UserData }>('/api/user');

        // ★ response.data.data を userData として取得
        const userData = response.data.data;

        if (!userData) {
            throw new Error('User data is missing in the response.');
        }

        console.log("ログイン成功！ユーザー情報:", userData);
        // ★★★ 正しいユーザーデータ (userData) で loginAction を呼び出す ★★★
        loginAction(userData);
        // ★ フォームからのリダイレクトは削除 (LoginPage に任せる)
        // navigate('/');

      } catch (userError) {
        console.error("ログイン後のユーザー情報取得エラー:", userError);
        setApiError("ログインに成功しましたが、ユーザー情報の取得に失敗しました。ページを更新してください。");
        // ここで logoutAction() を呼んで中途半端なログイン状態を防ぐことも検討
      }

    } catch (error: any) {
      console.error("ログインAPIエラー:", error);
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          if (key === 'email' || key === 'password') {
             form.setError(key as 'email' | 'password', { // 型アサーション
               type: "manual",
               message: validationErrors[key][0],
             });
          }
        });
        setApiError("入力内容に誤りがあります。");
      } else if (error.response && error.response.status === 401) {
         const message = error.response.data.errors?.email?.[0] ||
                         error.response.data.message ||
                         "メールアドレスまたはパスワードが違います。";
         setApiError(message);
      } else {
        setApiError("ログイン中に予期せぬエラーが発生しました。");
      }
    } finally {
       // isSubmitting を使う場合、ここで false に戻す必要はない (react-hook-form が管理)
    }
  }

  return (
    <Form {...form}> {/* form オブジェクトを Form コンポーネントに渡す */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"> {/* handleSubmit で onSubmit をラップ */}
        {/* メールアドレス入力フィールド */}
        <FormField
          control={form.control} // form.control を渡す
          name="email" // スキーマのキー名と一致させる
          render={({ field }) => ( // レンダリング関数
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormDescription>
                ログインに使用するメールアドレスです。
              </FormDescription>
              <FormMessage /> {/* バリデーションエラーメッセージ表示用 */}
            </FormItem>
          )}
        />
        {/* パスワード入力フィールド */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                {/* type="password" を指定 */}
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormDescription>
                8文字以上で入力してください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* APIエラーメッセージの表示 */}
        {apiError && (
          <p className="text-sm font-medium text-destructive">{apiError}</p>
        )}

        {/* 送信ボタン (ローディング状態を考慮) */}
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting} // isSubmitting を disabled 属性にバインド
        >
          {form.formState.isSubmitting ? "ログイン中..." : "ログイン"} {/* isSubmitting でテキストを切り替え */}
        </Button>
      </form>
    </Form>
  );
}