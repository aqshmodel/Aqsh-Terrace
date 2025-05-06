// src/components/LoginForm.tsx
"use client"; // Vite+Reactでは通常不要ですが、念のため残しておきます

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod"; // Zod は zodResolver で使用されています
import { useState } from "react"; // エラー表示用に useState をインポート

// shadcn/ui の Form コンポーネント群をインポート
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

// 作成したバリデーションスキーマと型をインポート
import { loginSchema, LoginFormValues } from "@/lib/validators/authValidators";
// API クライアントと Zustand ストアをインポート
import apiClient from "@/lib/apiClient";
import useAuthStore from "@/stores/authStore";

export function LoginForm() {
  // 1. useForm フックでフォームを初期化
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema), // Zod スキーマを連携
    defaultValues: { // フォームの初期値
      email: "",
      password: "",
      // remember: false, // もし remember フィールドを追加した場合
    },
  });

  const loginAction = useAuthStore((state) => state.login); // Zustand の login アクションを取得
  const [apiError, setApiError] = useState<string | null>(null); // APIエラーメッセージ用state

  // 2. フォーム送信時の処理を定義
  async function onSubmit(values: LoginFormValues) {
    setApiError(null); // エラーメッセージをリセット
    try {
      // ログイン API を呼び出し (POST リクエスト)
      // Vite プロキシ経由のためパスは '/login'
      // 注意: remember フィールドをスキーマに追加した場合、values に含まれる
      await apiClient.post('/api/login', values);

      // ログイン成功時の処理:
      // TODO: /api/user を叩いて実際のユーザー情報を取得し、ストアに渡す
      //       (次のステップで実装)
      console.log("ログインAPI呼び出し成功、ユーザー情報取得処理へ...");

      // ---- ここからユーザー情報取得処理 (仮実装を改善) ----
      try {
        const response = await apiClient.get('/api/user'); // /api/user を叩く
        const userData = response.data; // APIから返されたユーザー情報
        loginAction(userData); // Zustand ストアを実際のユーザー情報で更新
        console.log("ログイン成功！ユーザー情報:", userData);
        // ログイン後のリダイレクトは LoginPage.tsx や Layout.tsx で処理される想定
      } catch (userError) {
        console.error("ログイン後のユーザー情報取得エラー:", userError);
        setApiError("ログインには成功しましたが、ユーザー情報の取得に失敗しました。");
        // この場合でも部分的にログイン状態にするか、完全に失敗扱いにするか検討が必要
      }
      // ---- ここまでユーザー情報取得処理 ----

    } catch (error: any) { // ログインAPI自体のエラーハンドリング
      console.error("ログインAPIエラー:", error);
      if (error.response && error.response.status === 422) {
        // バリデーションエラー (Laravel が ValidationException を返した場合)
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          // setError の型安全性を高めるためのチェック (より厳密にするなら)
          if (key === 'email' || key === 'password') {
             form.setError(key, {
               type: "manual",
               message: validationErrors[key][0], // 最初のメッセージを表示
             });
          }
        });
        setApiError("入力内容に誤りがあります。");
      } else if (error.response && error.response.status === 401) {
         // 認証情報不一致など (一般的なエラー)
         // Laravel の ValidationException で 'email' にエラーが返る場合もある
         const message = error.response.data.errors?.email?.[0] || // LaravelのValidationException形式
                         error.response.data.message ||             // 一般的なエラーメッセージ形式
                         "メールアドレスまたはパスワードが違います。";
         setApiError(message);
         // フォーム全体のエラーとして表示するか、特定のフィールドに紐付けるか検討
         // form.setError('email', { type: 'manual', message: message });
      } else {
        // その他のネットワークエラーなど
        setApiError("ログイン中に予期せぬエラーが発生しました。");
      }
    }
  }

  // 3. フォームの JSX を返す (shadcn/ui の Form を使用)
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