// src/lib/validators/commentValidators.ts
import { z } from "zod";

export const commentSchema = z.object({
  body: z.string()
    .min(1, { message: "コメントを入力してください。" })
    .max(500, { message: "コメントは500文字以内で入力してください。" }),
});

export type CommentFormValues = z.infer<typeof commentSchema>;