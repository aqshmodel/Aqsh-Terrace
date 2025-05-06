<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SkillResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // config から表示用のラベルを取得
        $typeLabel = config('metadata.skill_types.' . $this->type, $this->type);
        // pivot データ（中間テーブルの情報）を取得
        $pivot = $this->whenPivotLoaded('skill_user', function () {
            return [
                'level' => $this->pivot->level,
                'level_label' => config('metadata.skill_levels.' . $this->pivot->level, $this->pivot->level), // レベルのラベル
                'years_of_experience' => $this->pivot->years_of_experience,
                'description' => $this->pivot->description,
                // 'added_at' => $this->pivot->created_at?->toIso8601String(), // 中間テーブルに timestamps があれば
            ];
        });

        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'type_label' => $typeLabel,
            'category' => $this->category,
            // 中間テーブルの情報を 'pivot' キー（または任意のキー名）で含める
             // キー名を 'user_skill_details' のように具体的にしても良い
            'user_details' => $pivot, // whenPivotLoaded の結果をマージするのではなく、キーで含める

            // created_at/updated_at はスキルマスタ自体のものなので、通常はユーザー向けには不要かも
            // 'created_at' => $this->created_at?->toIso8601String(),
            // 'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}