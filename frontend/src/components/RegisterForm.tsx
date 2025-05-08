// src/components/RegisterForm.tsx
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

// 登録用スキーマと型をインポート
import { registerSchema, RegisterFormValues } from "@/lib/validators/authValidators";
import apiClient from "@/lib/apiClient";
// useAuthStore はここでは直接使わないことが多い (登録後にログインページへ促すため)

export function RegisterForm() {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(values: RegisterFormValues) {
    setApiError(null);
    setSuccessMessage(null);
    try {
      // API エンドポイントに '/api' プレフィックスが必要か確認！
      // routes/api.php に定義したので、通常は必要
      const response = await apiClient.post('/api/register', values);

      console.log("登録成功:", response.data);
      setSuccessMessage(response.data.message || "ユーザー登録が完了しました。ログインしてください。");

      // フォームをリセット (任意)
      form.reset();

      // 成功したらログインページへリダイレクト (任意)
      // setTimeout(() => navigate('/login'), 2000); // 2秒後にリダイレクト

    } catch (error: any) {
      console.error("登録エラー:", error);
      if (error.response && error.response.status === 422) {
        // バリデーションエラー (メールアドレス重複など)
        const validationErrors = error.response.data.errors;
        Object.keys(validationErrors).forEach((key) => {
          if (key === 'name' || key === 'email' || key === 'password') { // 型安全のため確認
            form.setError(key, {
              type: "manual",
              message: validationErrors[key][0],
            });
          } else {
            // 特定フィールド以外のエラー (例: password_confirmation の refine エラーなど)
            setApiError(validationErrors[key]?.[0] || "入力内容に誤りがあります。");
          }
        });
         if (!apiError) setApiError("入力内容を確認してください。");
      } else {
        setApiError("登録中にエラーが発生しました。");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 名前 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>名前</FormLabel>
              <FormControl>
                <Input placeholder="山田 太郎" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* メールアドレス */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* パスワード */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormDescription>8文字以上で入力してください。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* パスワード確認 */}
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード（確認用）</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* API エラー表示 */}
        {apiError && (
          <p className="text-sm font-medium text-destructive">{apiError}</p>
        )}
        {/* 成功メッセージ表示 */}
        {successMessage && (
          <p className="text-sm font-medium text-green-600">{successMessage}</p>
        )}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "登録中..." : "登録する"}
        </Button>
      </form>
    </Form>
  );
}