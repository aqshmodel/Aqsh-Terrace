// src/lib/validators/authValidators.ts
import { z } from "zod";

// --- ログイン用スキーマ ---
export const loginSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
  // remember: z.boolean().optional(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// --- 登録用スキーマ --- ★ ここから追加 ★
export const registerSchema = z.object({
  name: z.string().min(1, { message: "名前を入力してください。" }).max(255),
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(8, { message: "パスワードは8文字以上で入力してください。" }),
  password_confirmation: z.string().min(8, { message: "確認用パスワードは8文字以上で入力してください。" }),
}).refine((data) => data.password === data.password_confirmation, {
  // パスワードと確認用パスワードが一致しない場合のエラー
  message: "パスワードが一致しません。",
  path: ["password_confirmation"], // エラーを password_confirmation フィールドに関連付ける
});
export type RegisterFormValues = z.infer<typeof registerSchema>;
// ★ ここまで追加 ★