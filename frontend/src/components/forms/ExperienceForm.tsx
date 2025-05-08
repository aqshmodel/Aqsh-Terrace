// frontend/src/components/forms/ExperienceForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Select コンポーネント
import { Experience } from '@/types/user'; // Experience 型
import { Loader2 } from 'lucide-react';

// --- Zod スキーマ定義 ---
const experienceSchema = z.object({
    company_name: z.string().min(1, "会社名は必須です。").max(255),
    position: z.string().min(1, "役職は必須です。").max(255),
    start_date: z.string()
        .min(7, "開始年月は YYYY-MM 形式で入力してください。") // 文字数でも簡易チェック
        .regex(/^\d{4}-\d{2}$/, "開始年月は YYYY-MM 形式で入力してください。"), // 正規表現で形式チェック
    end_date: z.string()
        .regex(/^\d{4}-\d{2}$/, { message: "終了年月は YYYY-MM 形式で入力してください。" })
        .nullable()
        .optional()
        .or(z.literal('')), // YYYY-MM or 空文字 or null
    industry: z.string().nullable().optional(),
    company_size: z.string().nullable().optional(),
    description: z.string().max(65535).nullable().optional(),
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
export type ExperienceFormData = z.infer<typeof experienceSchema>;

// --- コンポーネント Props ---
interface ExperienceFormProps {
    initialData?: Experience | null; // 編集時の初期データ (新規追加時は undefined or null)
    metadata: { // 選択肢用のメタデータ
        industries: Record<string, string>;
        company_sizes: Record<string, string>;
    };
    onSubmit: (data: ExperienceFormData) => void; // 送信処理
    isPending: boolean; // 送信中フラグ
}

// --- フォームコンポーネント ---
export function ExperienceForm({ initialData, metadata, onSubmit, isPending }: ExperienceFormProps) {

    // フォームの初期化
    const form = useForm<ExperienceFormData>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            company_name: initialData?.company_name ?? "",
            position: initialData?.position ?? "",
            start_date: initialData?.start_date ?? "", // YYYY-MM 想定
            end_date: initialData?.end_date ?? "",     // YYYY-MM 想定
            industry: initialData?.industry || "none", // API値がnull/空なら"none"
            company_size: initialData?.company_size || "none", // API値がnull/空なら"none"
            description: initialData?.description ?? "",
        },
    });

    // フォーム送信ハンドラ
    const handleFormSubmit = (values: ExperienceFormData) => {
        // console.log("Experience form values:", values);
        // 空文字を null に変換 (API仕様に合わせる)
        const submittedValues = {
            ...values,
            end_date: values.end_date || null,
            industry: values.industry === "none" ? null : values.industry, // "none" なら null
            company_size: values.company_size === "none" ? null : values.company_size, // "none" なら null
            description: values.description || null,
        };
        onSubmit(submittedValues);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* 会社名 */}
                <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>会社名 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="株式会社〇〇" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 役職 */}
                 <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>役職・職種 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="Webエンジニア" {...field} />
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
                                <FormLabel>開始年月 <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    {/* シンプルな Input (年月ピッカーは別途ライブラリ等検討) */}
                                    <Input type="month" placeholder="YYYY-MM" {...field} />
                                    {/*
                                    <Input
                                        type="text"
                                        placeholder="YYYY-MM"
                                        pattern="\d{4}-\d{2}" // 簡単な形式補助
                                        maxLength={7}
                                        {...field}
                                    />
                                     */}
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
                                <FormLabel>終了年月</FormLabel>
                                <FormControl>
                                    <Input type="month" placeholder="YYYY-MM (在職中の場合は空欄)" {...field} value={field.value ?? ""} />
                                     {/*
                                    <Input
                                        type="text"
                                        placeholder="YYYY-MM (在職中の場合は空欄)"
                                        pattern="\d{4}-\d{2}"
                                        maxLength={7}
                                        {...field}
                                        value={field.value ?? ""}
                                    />
                                     */}
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                {/* 業界 */}
                 <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>業界</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="業界を選択してください" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {/* 未選択用の項目 */}
                                    <SelectItem value="none">-- 選択しない --</SelectItem>
                                    {Object.entries(metadata.industries).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 企業規模 */}
                <FormField
                    control={form.control}
                    name="company_size"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>企業規模</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="企業規模を選択してください" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                     <SelectItem value="none">-- 選択しない --</SelectItem>
                                     {Object.entries(metadata.company_sizes).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 業務内容 */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>業務内容・実績</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="担当業務、使用技術、個人の役割と成果、プロジェクトやチームでの成果などを具体的に記述してください。"
                                    className="min-h-[120px]"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormDescription>
                                Markdown 形式も利用できます。
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 送信ボタン */}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? '更新する' : '追加する'} {/* ボタンテキストを編集/新規で変更 */}
                </Button>
            </form>
        </Form>
    );
}