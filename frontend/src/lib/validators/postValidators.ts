// src/lib/validators/postValidators.ts
import { z } from "zod";

export const postSchema = z.object({
  body: z.string()
    .min(1, { message: "投稿内容を入力してください。" })
    .max(1000, { message: "投稿内容は1000文字以内で入力してください。" }),
  // title: z.string().max(255).optional(), // タイトルが必要な場合
});

export type PostFormValues = z.infer<typeof postSchema>;