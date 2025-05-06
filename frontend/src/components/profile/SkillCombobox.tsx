// frontend/src/components/profile/SkillCombobox.tsx
import * as React from "react"
import { ChevronsUpDown, Search, Loader2 } from "lucide-react" // Check は未使用なので削除

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
import { ScrollArea } from "@/components/ui/scroll-area"; // スクロール用にインポート

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
  const [open, setOpen] = React.useState(false);

  // ★ クリックまたはキーボード選択時の共通処理
  const handleSelect = (skill: SkillMaster | undefined) => {
      if (skill) {
          onSelectSkill(skill); // 親コンポーネントに選択されたスキル情報を渡す
          setOpen(false); // ポップオーバーを閉じる
      } else {
          // 念のため、skill が undefined の場合の処理 (通常は発生しないはず)
          console.warn("handleSelect called with undefined skill");
      }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", className)} // font-normal を追加して通常のボタンテキストのように
        >
          <span className="truncate">
             {placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}> {/* フロントエンドフィルタリングは不要 */}
          <CommandInput
             placeholder="スキル名で検索..." // プレースホルダーを具体的に
             value={searchQuery}
             onValueChange={onSearchChange}
             icon={<Search className="h-4 w-4 text-muted-foreground" />}
             disabled={isLoading}
          />
          {/* ★ CommandList の代わりに ScrollArea を使用 */}
          <ScrollArea className="max-h-[200px]"> {/* 高さを適宜調整 */}
            <CommandList> {/* CommandList はキーボードナビゲーションのために残す */}
                {isLoading && (
                    <div className="py-6 text-center text-sm flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {loadingPlaceholder}
                    </div>
                )}
                {!isLoading && searchResults.length === 0 && searchQuery.length > 0 && (
                    <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
                )}
                {!isLoading && searchResults.length === 0 && searchQuery.length === 0 && (
                     <CommandEmpty>スキル名を入力して検索してください。</CommandEmpty>
                )}
                {!isLoading && searchResults.length > 0 && (
                   <CommandGroup>
                    {searchResults.map((skill) => (
                       <CommandItem
                           key={skill.id}
                           value={skill.name} // value はキーボード操作と onSelect の引数に使われる
                           // ★ onSelect: キーボード操作 (Enter) で選択された場合の処理
                           onSelect={(currentValue) => {
                               // value (skill.name) を元に skill オブジェクトを再度検索
                               const selected = searchResults.find(
                                   s => s.name.toLowerCase() === currentValue.toLowerCase()
                               );
                               handleSelect(selected); // 共通ハンドラを呼び出す
                           }}
                           // ★ onMouseDown: マウスクリック (プレス) で選択された場合の処理
                           onMouseDown={(e) => {
                               // デフォルトのフォーカス移動や他のイベント発火を抑制する (場合によっては必要)
                               // e.preventDefault();
                               handleSelect(skill); // 直接 skill オブジェクトを渡して共通処理を呼ぶ
                           }}
                           // ★ style: クリック可能であることを示すカーソルスタイル
                           style={{ cursor: 'pointer' }}
                           className="flex justify-between w-full items-center" // items-center 追加
                       >
                         {/* スキル名 */}
                         <span className="truncate">{skill.name}</span>
                         {/* スキルタイプ (右寄せなどスタイル調整はお好みで) */}
                         {skill.type_label && <span className="ml-2 text-xs text-muted-foreground flex-shrink-0">{skill.type_label}</span>}
                       </CommandItem>
                    ))}
                   </CommandGroup>
                )}
            </CommandList>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  )
}