// frontend/src/components/profile/SkillCombobox.tsx
import * as React from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Skill as SkillMaster } from "@/types/user"; // スキルマスタの型

interface SkillComboboxProps {
    searchQuery: string;
    onSearchChange: (query: string) => void; // 検索クエリ変更ハンドラ
    searchResults: SkillMaster[]; // APIからの検索結果
    onSelectSkill: (skill: SkillMaster) => void; // スキル選択ハンドラ
    isLoading: boolean; // 検索中フラグ
    placeholder?: string;
    loadingPlaceholder?: string;
    emptyPlaceholder?: string;
    className?: string; // PopoverTrigger (Button) に適用するクラス
}

export function SkillCombobox({
    searchQuery,
    onSearchChange,
    searchResults,
    onSelectSkill,
    isLoading,
    placeholder = "スキルを選択...",
    loadingPlaceholder = "検索中...",
    emptyPlaceholder = "スキルが見つかりません。",
    className,
}: SkillComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)} // 幅を親要素に合わせる
        >
          <span className="truncate">
             {placeholder} {/* 常にプレースホルダー表示で良いかも */}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start"> {/* トリガーと同じ幅 */}
        <Command shouldFilter={false}> {/* フロントエンドでのフィルタリングは不要 */}
          <CommandInput
             placeholder={placeholder}
             value={searchQuery}
             onValueChange={onSearchChange} // 入力値変更時に検索を実行
             // ★ 検索アイコンを追加
             icon={<Search className="h-4 w-4 text-muted-foreground" />}
             disabled={isLoading}
          />
          <CommandList>
             {isLoading && (
                 <div className="py-6 text-center text-sm flex items-center justify-center text-muted-foreground">
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     {loadingPlaceholder}
                 </div>
             )}
             {!isLoading && searchResults.length === 0 && searchQuery.length > 0 && (
                 <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
             )}
             {!isLoading && searchResults.length > 0 && (
                <CommandGroup>
                 {searchResults.map((skill) => (
                    <CommandItem
                        key={skill.id}
                        value={skill.name} // value は一意な文字列が良い (選択時の識別に使う)
                        onSelect={(currentValue) => {
                            // currentValue は CommandItem の value (ここでは skill.name)
                            const selected = searchResults.find(
                                s => s.name.toLowerCase() === currentValue.toLowerCase()
                            );
                            if (selected) {
                                onSelectSkill(selected) // 親コンポーネントに選択されたスキルを渡す
                                setOpen(false) // ポップオーバーを閉じる
                            }
                        }}
                    >
                      {/* チェックマークは不要なので削除 */}
                      {/* <Check className={cn("mr-2 h-4 w-4", ???)} /> */}
                      <span>{skill.name}</span>
                      {skill.type_label && <span className="ml-2 text-xs text-muted-foreground">{skill.type_label}</span>}
                    </CommandItem>
                 ))}
                </CommandGroup>
             )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}