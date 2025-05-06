// frontend/src/components/profile/SkillItem.tsx
import React from 'react';
import { UserSkill } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { X, Star, CalendarDays } from 'lucide-react'; // アイコン追加
import { Label } from '@/components/ui/label'; // Label コンポーネント

interface SkillItemProps {
    skill: UserSkill;
    metadata?: { // レベル選択肢用 (オプショナルにしておく)
        skill_levels: Record<string, string>;
    };
    onUpdate: (
        skillId: number,
        field: 'level' | 'years_of_experience' | 'description',
        value: number | string | null
    ) => void;
    onRemove: (skillId: number) => void;
}

export function SkillItem({ skill, metadata, onUpdate, onRemove }: SkillItemProps) {
    // レベル選択肢 (メタデータがない場合や空の場合はデフォルトを表示)
    const levelOptions = metadata?.skill_levels ? Object.entries(metadata.skill_levels) : [
        ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'] // デフォルト
    ];

    // null を 'none' 文字列に変換して Select の value に渡す
    const currentLevelValue = skill.user_details?.level === null || skill.user_details?.level === undefined
        ? "none"
        : String(skill.user_details.level); // 数値を文字列に

    const handleLevelChange = (value: string) => {
        // 'none' が選択されたら null を、それ以外は数値に変換して onUpdate を呼ぶ
        const newLevel = value === "none" ? null : parseInt(value, 10);
        onUpdate(skill.id, 'level', isNaN(newLevel as number) ? null : newLevel); // 数値でなければ null
    };

    const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // 空文字列は null、それ以外は数値に変換 (バリデーションは zod などに任せる想定)
        const newYears = value === "" ? null : parseInt(value, 10);
        onUpdate(skill.id, 'years_of_experience', isNaN(newYears as number) ? null : newYears);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(skill.id, 'description', e.target.value || null); // 空文字列は null に
    };

    return (
        <div className="border rounded-md p-4 space-y-3 relative bg-card/50 hover:bg-card/80 transition-colors">
             {/* 削除ボタン */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(skill.id)}
            >
                <X className="h-4 w-4" />
            </Button>

            {/* スキル名とタイプ */}
            <div>
                 <Badge variant="secondary" className="text-base font-semibold px-3 py-1">
                    {skill.name}
                 </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                    {skill.type_label || skill.type} {skill.category && `(${skill.category})`}
                </p>
            </div>

            {/* レベルと経験年数 (横並び) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {/* スキルレベル */}
                <div className="space-y-1">
                    <Label htmlFor={`skill-level-${skill.id}`} className="text-xs font-medium flex items-center">
                         <Star className="h-3 w-3 mr-1 text-yellow-500"/> スキルレベル
                    </Label>
                    <Select onValueChange={handleLevelChange} value={currentLevelValue}>
                        <SelectTrigger id={`skill-level-${skill.id}`} className="h-9 text-sm">
                            <SelectValue placeholder="レベルを選択" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">-- 未選択 --</SelectItem>
                            {levelOptions.map(([key, label]) => (
                                <SelectItem key={key} value={key} className="text-sm">
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                 </div>

                 {/* 経験年数 */}
                 <div className="space-y-1">
                     <Label htmlFor={`skill-years-${skill.id}`} className="text-xs font-medium flex items-center">
                         <CalendarDays className="h-3 w-3 mr-1 text-muted-foreground"/> 経験年数
                     </Label>
                    <Input
                        id={`skill-years-${skill.id}`}
                        type="number"
                        min="0"
                        max="50" // 例
                        placeholder="年数 (例: 3)"
                        className="h-9 text-sm"
                        value={skill.user_details?.years_of_experience ?? ""} // null なら空文字
                        onChange={handleYearsChange}
                    />
                 </div>
            </div>

            {/* 補足説明 */}
            <div className="space-y-1">
                <Label htmlFor={`skill-desc-${skill.id}`} className="text-xs font-medium">
                    補足説明 (任意)
                </Label>
                <Textarea
                    id={`skill-desc-${skill.id}`}
                    placeholder="具体的なプロジェクト経験、資格名など (500文字以内)"
                    className="min-h-[60px] text-sm"
                    maxLength={500}
                    value={skill.user_details?.description ?? ""} // null なら空文字
                    onChange={handleDescriptionChange}
                />
            </div>
        </div>
    );
}