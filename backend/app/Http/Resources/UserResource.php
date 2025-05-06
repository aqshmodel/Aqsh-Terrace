<?php
// app/Http/Resources/UserResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth; // ログインユーザー判定用

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $loggedInUser = Auth::user();
        $isOwner = $loggedInUser && $loggedInUser->id === $this->id; // プロフィール所有者かどうかのフラグ

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->when($isOwner, $this->email), // 本人の場合にのみ email を含める (例)
            'profile_image_url' => $this->profile_image_url, // TODO: デフォルト画像の設定
            'headline' => $this->headline,
            'location' => $this->location,
            'introduction' => $this->introduction,
            'contact_email' => $this->when($isOwner, $this->contact_email), // 本人の場合のみ
            'social_links' => $this->social_links ?? [], // null なら空配列
            'experienced_industries' => $this->experienced_industries ?? [], // null なら空配列
            'experienced_company_types' => $this->experienced_company_types ?? [], // null なら空配列
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),

            // --- リレーションデータ ---
            // whenLoaded() を使い、リレーションがロードされている場合のみ含める
            'experiences' => ExperienceResource::collection($this->whenLoaded('experiences')),
            'educations' => EducationResource::collection($this->whenLoaded('educations')),
            'skills' => SkillResource::collection($this->whenLoaded('skills')), // 中間テーブル情報も含まれる
            'portfolio_items' => PortfolioItemResource::collection($this->whenLoaded('portfolioItems')),

            // --- 追加情報 (フォロー関連など) ---
            // when() を使い、ログインユーザーが存在する場合のみ含める
            'is_following' => $this->when(Auth::check(), function () use ($loggedInUser) {
                // $user->followers リレーションをロードする必要がある場合がある
                // return $loggedInUser->isFollowing($this->resource); // isFollowing メソッドがある場合
                 // または exists でチェック
                 return $loggedInUser->followings()->where('following_id', $this->id)->exists();
            }),
            'followers_count' => $this->whenCounted('followers', $this->followers()->count()), // withCount されている場合 or 直接カウント
            'followings_count' => $this->whenCounted('followings', $this->followings()->count()), // withCount されている場合 or 直接カウント

            // 投稿数なども必要なら追加
            'posts_count' => $this->whenCounted('posts', $this->posts()->count()),

             // --- メタ情報 ---
             'is_owner' => $isOwner, // フロントエンドで編集ボタン表示などに使う
        ];
    }
}