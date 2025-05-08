// frontend/src/components/forms/PortfolioForm.tsx
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
import { PortfolioItem } from '@/types/user'; // PortfolioItem 型
import { Loader2 } from 'lucide-react';

// --- Zod スキーマ定義 ---
// Store/UpdatePortfolioItemRequest に合わせる
const portfolioSchema = z.object({
    title: z.string().min(1, "タイトルは必須です。").max(255),
    url: z.string().url("有効なURLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
    description: z.string().max(65535).nullable().optional(), // TEXT 想定
    // thumbnail_url は v1.1 以降
});

// フォームデータの型
export type PortfolioFormData = z.infer<typeof portfolioSchema>;

// --- コンポーネント Props ---
interface PortfolioFormProps {
    initialData?: PortfolioItem | null; // 編集時の初期データ
    onSubmit: (data: PortfolioFormData) => void; // 送信処理
    isPending: boolean; // 送信中フラグ
}

// --- フォームコンポーネント ---
export function PortfolioForm({ initialData, onSubmit, isPending }: PortfolioFormProps) {

    const form = useForm<PortfolioFormData>({
        resolver: zodResolver(portfolioSchema),
        defaultValues: {
            title: initialData?.title ?? "",
            url: initialData?.url ?? "",
            description: initialData?.description ?? "",
        },
    });

    const handleFormSubmit = (values: PortfolioFormData) => {
        // console.log("Portfolio form values:", values);
        const submittedValues = {
            ...values,
            url: values.url || null, // 空文字を null に
            description: values.description || null,
        };
        onSubmit(submittedValues);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* タイトル */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>タイトル <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="例: 個人開発した〇〇アプリ" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* URL */}
                 <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                                <Input type="url" placeholder="https://example.com/portfolio" {...field} value={field.value ?? ""} />
                            </FormControl>
                             <FormDescription>
                                作品や実績が公開されているURLがあれば入力してください。
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* 説明 */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>概要説明</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="作品の概要、使用技術、担当箇所などを記述してください。"
                                    className="min-h-[100px]"
                                    maxLength={65535} // スキーマに合わせる
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 {/* TODO: v1.1 サムネイルアップロード */}

                {/* 送信ボタン */}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? '更新する' : '追加する'}
                </Button>
            </form>
        </Form>
    );
}