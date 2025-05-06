<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User; // 必要なら

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PortfolioItem>
 */
class PortfolioItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 'user_id' は UserFactory で設定
            // ★ title の生成方法を変更 ★
            // 'title' => fake()->catchPhrase(), // これは ja_JP にはない可能性
            'title' => fake()->realText(rand(15, 50)), // 例1: 短めのリアルな日本語テキスト
            // 'title' => fake()->company() . 'プロジェクト実績', // 例2: 会社名と組み合わせる
            // 'title' => fake()->bs() . 'に関する考察', // 例3: bs (ビジネス用語っぽいもの) を使う
            'url' => fake()->optional()->url(),
            'description' => fake()->realText(rand(100, 500)), 
            'thumbnail_url' => null,
        ];
    }
}