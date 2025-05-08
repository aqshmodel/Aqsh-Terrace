// frontend/src/components/forms/BasicInfoForm.tsx
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
import { Checkbox } from "@/components/ui/checkbox"; // チェックボックス用
import { UserProfile } from '@/types/user'; // 型
// ★ アイコンを追加: Facebook, Instagram, Building2 (会社), Link (URL)
import { Loader2, Github, Twitter, Linkedin, Facebook, Instagram, Building2, Link as LinkIcon } from 'lucide-react';

// --- Zod スキーマ定義 ---
// UpdateProfileRequest.php のルールに合わせる
const profileSchema = z.object({
    name: z.string().min(1, "氏名は必須です。").max(255, "氏名は255文字以内で入力してください。"),
    headline: z.string().max(255, "キャッチコピーは255文字以内で入力してください。").nullable().optional(),
    location: z.string().max(255, "居住地は255文字以内で入力してください。").nullable().optional(),
    introduction: z.string().max(65535, "自己紹介は65535文字以内で入力してください。").nullable().optional(), // TEXT想定
    contact_email: z.string().email("有効なメールアドレスを入力してください。").max(255).nullable().optional().or(z.literal('')), // email or 空文字 or null
    social_links: z.object({
        github: z.string().url("有効なGitHub URLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
        twitter: z.string().url("有効なTwitter/X URLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
        linkedin: z.string().url("有効なLinkedIn URLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
        // ★ Facebook と Instagram を追加
        facebook: z.string().url("有効なFacebook URLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
        instagram: z.string().url("有効なInstagram URLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
    }).nullable().optional(),
    experienced_industries: z.array(z.string()).max(5, "経験業界は最大5つまで選択できます。"),
    experienced_company_types: z.array(z.string()).max(3, "経験企業タイプは最大3つまで選択できます。"),
    // ★ 所属企業情報を追加
    current_company_name: z.string().max(255, "所属企業名は255文字以内で入力してください。").nullable().optional(),
    current_company_url: z.string().url("有効な所属企業URLを入力してください。").max(2048).nullable().optional().or(z.literal('')),
});

// フォームデータの型
export type ProfileFormData = z.infer<typeof profileSchema>;

// --- コンポーネント Props ---
interface BasicInfoFormProps {
    initialData: UserProfile; // 初期表示用のデータ
    metadata: { // 選択肢用のメタデータ
        industries: Record<string, string>;
        company_types: Record<string, string>;
    };
    onSubmit: (data: ProfileFormData) => void; // 送信処理
    isPending: boolean; // 送信中フラグ
}

// --- フォームコンポーネント ---
export function BasicInfoForm({ initialData, metadata, onSubmit, isPending }: BasicInfoFormProps) {

    // フォームの初期化 (react-hook-form)
    const form = useForm<ProfileFormData>({ // ★ ProfileFormData 型を使用
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: initialData.name ?? "",
            headline: initialData.headline ?? "",
            location: initialData.location ?? "",
            introduction: initialData.introduction ?? "",
            contact_email: initialData.contact_email ?? "",
            social_links: { // null の場合は空文字で初期化
                github: initialData.social_links?.github ?? "",
                twitter: initialData.social_links?.twitter ?? "",
                linkedin: initialData.social_links?.linkedin ?? "",
                // ★ Facebook, Instagram の初期値を追加
                facebook: initialData.social_links?.facebook ?? "",
                instagram: initialData.social_links?.instagram ?? "",
            },
            experienced_industries: initialData.experienced_industries ?? [], // null なら空配列
            experienced_company_types: initialData.experienced_company_types ?? [], // null なら空配列
            // ★ 所属企業情報の初期値を追加
            current_company_name: initialData.current_company_name ?? "",
            current_company_url: initialData.current_company_url ?? "",
        },
    });

    // フォーム送信ハンドラ
    const handleFormSubmit = (values: ProfileFormData) => {
        // console.log("Form values:", values); // デバッグ用
        // social_links 内の空文字を null に変換する (API仕様による)
        const submittedValues = {
            ...values,
            // ★ current_company_url も空文字なら null に変換
            current_company_name: values.current_company_name || null,
            current_company_url: values.current_company_url || null,
            social_links: {
                github: values.social_links?.github || null,
                twitter: values.social_links?.twitter || null,
                linkedin: values.social_links?.linkedin || null,
                // ★ Facebook, Instagram も変換
                facebook: values.social_links?.facebook || null,
                instagram: values.social_links?.instagram || null,
            }
        };
        onSubmit(submittedValues); // 親コンポーネントから渡された onSubmit を呼び出す
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
                {/* --- 基本フィールド --- */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>氏名 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="山田 太郎" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="headline"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>キャッチコピー / 現在の役職</FormLabel>
                            <FormControl>
                                <Input placeholder="例: フルスタックエンジニア | React と Laravel が得意です" {...field} value={field.value ?? ""} />
                            </FormControl>
                             <FormDescription>
                                プロフィール上部に表示される短い紹介文です。
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {/* ★ 所属企業情報フィールドを追加 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                    <FormField
                        control={form.control}
                        name="current_company_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><Building2 className="h-4 w-4 mr-2 text-muted-foreground"/>所属企業名</FormLabel>
                                <FormControl>
                                    <Input placeholder="例: 株式会社〇〇" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="current_company_url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><LinkIcon className="h-4 w-4 mr-2 text-muted-foreground"/>所属企業URL</FormLabel>
                                <FormControl>
                                    <Input type="url" placeholder="https://example.com" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>居住地</FormLabel>
                            <FormControl>
                                <Input placeholder="例: 東京都" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="introduction"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>自己紹介</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="これまでの経験、スキル、興味関心など自由にご記入ください。"
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                             <FormDescription>
                                Markdown 形式での記述も可能です (プレビュー機能は未実装)。
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>連絡先メールアドレス (公開用)</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="contact@example.com" {...field} value={field.value ?? ""} />
                            </FormControl>
                             <FormDescription>
                                プロフィールページで公開される連絡先です。入力は任意です。
                             </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* --- ソーシャルリンク --- */}
                <div className="space-y-4 rounded-md border p-4">
                     <h3 className="text-sm font-medium mb-4">ソーシャルリンク</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                         <FormField
                            control={form.control}
                            name="social_links.github"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Github className="h-4 w-4 mr-2 text-muted-foreground"/>GitHub</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://github.com/yourusername" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="social_links.twitter"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Twitter className="h-4 w-4 mr-2 text-muted-foreground"/>Twitter / X</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://x.com/yourusername" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="social_links.linkedin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Linkedin className="h-4 w-4 mr-2 text-muted-foreground"/>LinkedIn</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://linkedin.com/in/yourusername" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {/* ★ Facebook フィールド追加 */}
                         <FormField
                            control={form.control}
                            name="social_links.facebook"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Facebook className="h-4 w-4 mr-2 text-muted-foreground"/>Facebook</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://facebook.com/yourprofile" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         {/* ★ Instagram フィールド追加 */}
                         <FormField
                            control={form.control}
                            name="social_links.instagram"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center"><Instagram className="h-4 w-4 mr-2 text-muted-foreground"/>Instagram</FormLabel>
                                    <FormControl>
                                        <Input type="url" placeholder="https://instagram.com/yourusername" {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                     </div>
                </div>

                {/* --- 経験業界 (チェックボックス) --- */}
                <FormField
                    control={form.control}
                    name="experienced_industries"
                    render={({ }) => (
                        <FormItem className="space-y-3 rounded-md border p-4">
                            <FormLabel className="text-sm font-medium">主な経験業界 (複数選択可, 最大5つ)</FormLabel>
                             <FormControl>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                     {Object.entries(metadata.industries).map(([key, label]) => (
                                        <FormField
                                            key={key}
                                            control={form.control}
                                            name="experienced_industries"
                                            render={({ field: checkboxField }) => { // field 名の衝突を避ける
                                                return (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={checkboxField.value?.includes(key)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? checkboxField.onChange([...(checkboxField.value ?? []), key])
                                                                        : checkboxField.onChange(
                                                                              (checkboxField.value ?? []).filter(
                                                                                  (value) => value !== key
                                                                              )
                                                                          );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {label}
                                                        </FormLabel>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                     ))}
                                </div>
                            </FormControl>
                            <FormMessage /> {/* 配列全体のエラーメッセージ */}
                        </FormItem>
                    )}
                />

                 {/* --- 経験企業タイプ (チェックボックス) --- */}
                <FormField
                    control={form.control}
                    name="experienced_company_types"
                    render={({ }) => (
                         <FormItem className="space-y-3 rounded-md border p-4">
                            <FormLabel className="text-sm font-medium">主な経験企業タイプ (複数選択可, 最大3つ)</FormLabel>
                            <FormControl>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                     {Object.entries(metadata.company_types).map(([key, label]) => (
                                        <FormField
                                            key={key}
                                            control={form.control}
                                            name="experienced_company_types"
                                            render={({ field: checkboxField }) => {
                                                return (
                                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={checkboxField.value?.includes(key)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? checkboxField.onChange([...(checkboxField.value ?? []), key])
                                                                        : checkboxField.onChange(
                                                                              (checkboxField.value ?? []).filter(
                                                                                  (value) => value !== key
                                                                              )
                                                                          );
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                            {label}
                                                        </FormLabel>
                                                    </FormItem>
                                                );
                                            }}
                                        />
                                     ))}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* --- 送信ボタン --- */}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    基本情報を更新
                </Button>
            </form>
        </Form>
    );
}