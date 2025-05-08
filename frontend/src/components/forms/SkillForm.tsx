// frontend/src/components/forms/SkillForm.tsx
import { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserSkill, Skill as SkillMaster } from '@/types/user'; // 型
import { Loader2, Star, CalendarDays } from 'lucide-react';
import { SkillAsyncSelect } from '@/components/profile/SkillAsyncSelect'; // 作成済みの AsyncSelect

// --- Zod スキーマ定義 ---
// バックエンドの UpdateProfileSkillsRequest の要素に合わせる
const skillSchema = z.object({
    skill: z.custom<SkillMaster>(
        (val) => typeof val === 'object' && val !== null && 'id' in val && 'name' in val,
        { message: "スキルを選択してください。" }
    ),
    level: z.number().int().min(1).max(5).nullable().optional(),
    years_of_experience: z.number().int().min(0).max(50).nullable().optional(),
    description: z.string().max(500).nullable().optional(),
});

// フォームデータの型
export type SkillFormData = z.infer<typeof skillSchema>;

// --- コンポーネント Props ---
interface SkillFormProps {
    initialData?: UserSkill | null; // 編集時の初期データ (UserSkill 型)
    metadata: { // 選択肢用のメタデータ
        skill_levels: Record<string, string>;
    };
    onSubmit: (data: SkillFormData) => void; // 送信処理
    isPending: boolean; // 送信中フラグ
    // ★ 編集モードかどうかを判定するフラグ
    isEditMode: boolean;
    // ★ 現在登録済みのスキルIDリスト (検索候補から除外用)
    currentSkillIds: number[];
    // ★ react-select 用の入力値とハンドラ
    skillInputValue: string;
}

// --- フォームコンポーネント ---
export function SkillForm({
    initialData,
    metadata,
    onSubmit,
    isPending,
    isEditMode,
    currentSkillIds,
    skillInputValue,
}: SkillFormProps) {

    const form = useForm<SkillFormData>({
        resolver: zodResolver(skillSchema),
        defaultValues: {
            skill: initialData ? {
                id: initialData.id,
                name: initialData.name,
                type: initialData.type,
                category: initialData.category === null ? undefined : initialData.category,
            } : undefined,
            level: initialData?.user_details?.level ?? null,
            years_of_experience: initialData?.user_details?.years_of_experience ?? null,
            description: initialData?.user_details?.description ?? "",
        },
    });

    // 編集モードで initialData が変わったらフォーム値をリセット
    useEffect(() => {
        if (isEditMode && initialData) {
            form.reset({
                skill: {
                    id: initialData.id,
                    name: initialData.name,
                    type: initialData.type,
                    category: initialData.category === null ? undefined : initialData.category,
                },
                level: initialData.user_details?.level ?? null,
                years_of_experience: initialData.user_details?.years_of_experience ?? null,
                description: initialData.user_details?.description ?? "",
            });
        } else if (!isEditMode) {
             form.reset({ // 新規モードなら完全にリセット
                 skill: undefined,
                 level: null,
                 years_of_experience: null,
                 description: "",
             });
        }
    }, [initialData, isEditMode, form]);


    // フォーム送信ハンドラ
    const handleFormSubmit = (values: SkillFormData) => {
        // console.log("Skill form values:", values);
        // 数値フィールドで空文字や変換失敗の場合に null を設定
        const level = typeof values.level === 'number' ? values.level : null;
        const years = typeof values.years_of_experience === 'number' ? values.years_of_experience : null;

        const submittedValues: SkillFormData = {
            ...values,
            level: level,
            years_of_experience: years,
            description: values.description || null, // 空文字は null に
        };
        onSubmit(submittedValues);
    };

    // レベル選択肢
    const levelOptions = metadata?.skill_levels ? Object.entries(metadata.skill_levels) : [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                {/* スキル選択 (編集時は無効化) */}
                <FormField
                    control={form.control}
                    name="skill"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>スキル <span className="text-red-500">*</span></FormLabel>
                             {/* ★ 編集時は選択済みのスキル名を表示 (読み取り専用) */}
                             {isEditMode && field.value ? (
                                <div className='mt-2'>
                                    <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
                                        {field.value.name}
                                    </Badge>
                                     {/* 編集時は AsyncSelect を隠す */}
                                </div>
                             ) : (
                                 // ★ 新規追加時のみ AsyncSelect を表示
                                <FormControl>
                                    <SkillAsyncSelect
                                        onSelectSkill={(selectedSkill) => {
                                            // ★ react-hook-form の値を更新
                                            field.onChange(selectedSkill);
                                        }}
                                        // ★ 編集モードでない場合のみ除外リストを渡す
                                        excludeSkillIds={!isEditMode ? currentSkillIds : []}
                                        inputValue={skillInputValue}
                                        placeholder="スキル名で検索・選択..."
                                    />
                                </FormControl>
                             )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                 {/* レベルと経験年数 (横並び) */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    {/* スキルレベル */}
                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><Star className="h-3 w-3 mr-1 text-yellow-500"/>スキルレベル</FormLabel>
                                <Select
                                    onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value, 10))}
                                    // ★ 数値を文字列に変換し、null なら "none"
                                    value={field.value === null || field.value === undefined ? "none" : String(field.value)}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="レベルを選択" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="none">-- 未選択 --</SelectItem>
                                        {levelOptions.map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* 経験年数 */}
                     <FormField
                        control={form.control}
                        name="years_of_experience"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center"><CalendarDays className="h-3 w-3 mr-1 text-muted-foreground"/>経験年数</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="50"
                                        placeholder="年数 (例: 3)"
                                        // ★ 数値を文字列に変換し、null なら空文字
                                        value={field.value === null || field.value === undefined ? "" : String(field.value)}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            // ★ 空は null、それ以外は数値に変換して onChange
                                            field.onChange(val === "" ? null : parseInt(val, 10));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>

                {/* 補足説明 */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>補足説明 (任意)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="具体的なプロジェクト経験、資格名など (500文字以内)"
                                    className="min-h-[100px]"
                                    maxLength={500}
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
                    {isEditMode ? '更新する' : '追加する'}
                </Button>
            </form>
        </Form>
    );
}