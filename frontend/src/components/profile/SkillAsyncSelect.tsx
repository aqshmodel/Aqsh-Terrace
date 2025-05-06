// frontend/src/components/profile/SkillAsyncSelect.tsx
import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Skill as SkillMaster } from '@/types/user';
import apiClient from '@/lib/apiClient';
import { StylesConfig, InputActionMeta } from 'react-select'; // ★ InputActionMeta をインポート

interface SkillOption {
    value: number; // skill.id
    label: string; // skill.name
    skill: SkillMaster; // 元データも保持
}

// スキル検索 API 関数 (react-select の loadOptions 用)
const loadSkillOptions = (
    inputValue: string,
    callback: (options: SkillOption[]) => void
) => {
    // 入力がなければ空を返す
    if (!inputValue || inputValue.length < 1) { // または 2 文字以上など
        callback([]);
        return;
    }

    // 検索 API を呼び出し
    apiClient.get<SkillMaster[]>(`/api/skills?query=${encodeURIComponent(inputValue)}`)
        .then(response => {
            // react-select が要求する形式に変換
            const options = response.data.map(skill => ({
                value: skill.id,
                label: skill.name,
                skill: skill // 元のスキルデータも保持
            }));
            callback(options);
        })
        .catch(error => {
            console.error("Skill search error:", error);
            callback([]); // エラー時は空
        });
};

// react-select のスタイル (Tailwind に寄せる例 - 要調整)
const customStyles: StylesConfig<SkillOption, false> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'hsl(var(--input))',
        borderColor: state.isFocused ? 'hsl(var(--ring))' : 'hsl(var(--border))',
        boxShadow: state.isFocused ? `0 0 0 1px hsl(var(--ring))` : 'none',
        '&:hover': {
            borderColor: 'hsl(var(--border))'
        },
         minHeight: '40px', // h-10 相当
    }),
    input: (provided) => ({
        ...provided,
        color: 'hsl(var(--foreground))',
         margin: '0px',
         paddingBottom: '0px',
         paddingTop: '0px',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'hsl(var(--muted-foreground))'
    }),
    singleValue: (provided) => ({ // 選択後の値
         ...provided,
         color: 'hsl(var(--foreground))',
     }),
     valueContainer: (provided) => ({
         ...provided,
         padding: '0 8px',
     }),
     indicatorSeparator: () => ({ display: 'none' }), // 区切り線を消す
     dropdownIndicator: (provided) => ({
         ...provided,
         padding: '8px',
         color: 'hsl(var(--muted-foreground))',
          '&:hover': {
              color: 'hsl(var(--foreground))',
          },
     }),
     menu: (provided) => ({
         ...provided,
         backgroundColor: 'hsl(var(--popover))',
         color: 'hsl(var(--popover-foreground))',
         border: '1px solid hsl(var(--border))',
         borderRadius: 'var(--radius)', // shadcn の変数を使う (グローバル CSS に定義が必要な場合あり)
         boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
         zIndex: 51, // Popover より手前に
     }),
     option: (provided, state) => ({
         ...provided,
         backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'transparent',
         color: state.isFocused ? 'hsl(var(--accent-foreground))' : 'inherit',
         cursor: 'pointer',
         '&:active': { // クリック時の色
             backgroundColor: 'hsl(var(--accent))'
         },
     }),
     noOptionsMessage: (provided) => ({
         ...provided,
         textAlign: 'center',
         padding: '8px 12px',
         color: 'hsl(var(--muted-foreground))',
     }),
     loadingMessage: (provided) => ({
        ...provided,
        textAlign: 'center',
        padding: '8px 12px',
        color: 'hsl(var(--muted-foreground))',
     }),
     // 他の要素も必要に応じてスタイル調整
};


interface SkillAsyncSelectProps {
    onSelectSkill: (skill: SkillMaster) => void;
    placeholder?: string;
    noOptionsMessage?: (obj: { inputValue: string }) => React.ReactNode;
    loadingMessage?: (obj: { inputValue: string }) => React.ReactNode;
    excludeSkillIds?: number[];
    // ★ inputValue と onInputChange を Props に追加
    inputValue: string;
    onInputChange: (newValue: string, actionMeta: InputActionMeta) => void;
}

export function SkillAsyncSelect({
    onSelectSkill,
    placeholder = "スキル名で検索...",
    noOptionsMessage = ({ inputValue }) => inputValue ? "一致するスキルがありません" : "スキル名を入力してください",
    loadingMessage = () => "検索中...",
    excludeSkillIds = [],
    // ★ Props を受け取る
    inputValue,
    onInputChange,
}: SkillAsyncSelectProps) {

    const promiseOptions = (inputVal: string): Promise<SkillOption[]> => // 引数名変更
        new Promise((resolve) => {
            // ★ 外部から渡された inputValue ではなく、loadOptions の引数 inputVal を使う
            loadSkillOptions(inputVal, (options) => {
                resolve(options.filter(option => !excludeSkillIds.includes(option.value)));
            });
        });


    return (
        <AsyncSelect<SkillOption, false>
            cacheOptions
            loadOptions={promiseOptions}
            placeholder={placeholder}
            onChange={(selectedOption) => {
                if (selectedOption) {
                    onSelectSkill(selectedOption.skill);
                    // ★ 選択後に入力値をクリアする処理は呼び出し元で行う
                }
            }}
            noOptionsMessage={noOptionsMessage}
            loadingMessage={loadingMessage}
            styles={customStyles}
            inputValue={inputValue}
            onInputChange={onInputChange}
            // ★ value プロパティを追加し、常に null に設定
            value={null}
            inputId="skill-async-select"
        />
    );
}