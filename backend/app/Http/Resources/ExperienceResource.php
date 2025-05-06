<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExperienceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // config から表示用のラベルを取得
        $industryLabel = config('metadata.industries.' . $this->industry, $this->industry);
        $companySizeLabel = config('metadata.company_sizes.' . $this->company_size, $this->company_size);

        return [
            'id' => $this->id,
            'company_name' => $this->company_name,
            'position' => $this->position,
            'start_date' => $this->start_date?->format('Y-m'), // YYYY-MM 形式
            'end_date' => $this->end_date?->format('Y-m'), // YYYY-MM 形式、null の場合あり
            'industry' => $this->industry, // キーを返す
            'industry_label' => $industryLabel, // 表示用ラベルも返す
            'company_size' => $this->company_size, // キーを返す
            'company_size_label' => $companySizeLabel, // 表示用ラベルも返す
            'description' => $this->description,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            // user_id は通常不要 (ユーザー情報にネストされるため)
        ];
    }
}