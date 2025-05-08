// frontend/src/components/forms/EducationForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Education } from '@/types/user'; // Education 型
import { Loader2 } from 'lucide-react';

// --- Zod スキーマ定義 ---
// Store/UpdateEducationRequest に合わせる (日付は YYYY-MM 文字列想定)
const educationSchema = z.object({
    school_name: z.string().min(1, "学校名は必須です。").max(255),
    major: z.string().max(255).nullable().optional(), // 学部・専攻
    start_date: z.string()
        .min(7, "開始年月は YYYY-MM 形式で入力してください。")
        .regex(/^\d{4}-\d{2}$/, "開始年月は YYYY-MM 形式で入力してください。"),
    end_date: z.string()
        .regex(/^\d{4}-\d{2}$/, { message: "終了年月は YYYY-MM 形式で入力してください。" })
        .nullable()
        .optional()
        .or(z.literal('')), // YYYY-MM or 空文字 or null
    description: z.string().max(1000, "備考は1000文字以内で入力してください。").nullable().optional(), // 備考
}).refine(data => {
    if (data.end_date && data.start_date) {
        return data.end_date >= data.start_date;
    }
    return true;
}, {
    message: "終了年月は開始年月以降に設定してください。",
    path: ["end_date"],
});

// フォームデータの型
export type EducationFormData = z.infer<typeof educationSchema>;

// --- コンポーネント Props ---
interface EducationFormProps {
    initialData?: Education | null; // 編集時の初期データ
    onSubmit: (data: EducationFormData) => void; // 送信処理
    isPending: boolean; // 送信中フラグ
}

// --- フォームコンポーネント ---
export function EducationForm({ initialData, onSubmit, isPending }: EducationFormProps) {

    const form = useForm<EducationFormData>({
        resolver: zodResolver(educationSchema),
        defaultValues: {
            school_name: initialData?.school_name ?? "",
            major: initialData?.major ?? "",
            start_date: initialData?.start_date ?? "", // YYYY-MM
            end_date: initialData?.end_date ?? "",     // YYYY-MM
            description: initialData?.description ?? "",
        },
    });

    const handleFormSubmit = (values: EducationFormData) => {
        // console.log("Education form values:", values);
        const submittedValues = {
            ...values,
            end_date: values.end_date || null, // 空文字を null に
            major: values.major || null,
            description: values.description || null,
        };
        onSubmit(submittedValues);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* 学校名 */}
                <FormField
                    control={form.control}
                    name="school_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>学校名 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="〇〇大学" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 学部・専攻 */}
                 <FormField
                    control={form.control}
                    name="major"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>学部・専攻</FormLabel>
                            <FormControl>
                                <Input placeholder="経済学部 経済学科" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 {/* 在籍期間 */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <FormField
                        control={form.control}
                        name="start_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>入学年月 <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input type="month" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="end_date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>卒業年月</FormLabel>
                                <FormControl>
                                    <Input type="month" placeholder="YYYY-MM (卒業年月等)" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* 備考 */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>備考</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="研究内容、サークル活動、受賞歴など"
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 送信ボタン */}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? '更新する' : '追加する'}
                </Button>
            </form>
        </Form>
    );
}