<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User; // User ID を取得するために必要なら

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Education>
 */
class EducationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-6 years', '-2 years');
        $endDate = fake()->optional(0.9)->dateTimeBetween($startDate, '-1 year');

        // ★ major の生成方法を変更 ★
        // 'major' => fake()->optional()->bs(), // bs は ja_JP にはない
        $majors = ['文学部', '経済学部', '法学部', '理学部', '工学部', '医学部', '薬学部', '教育学部', '情報学部', '国際関係学部', '芸術学部']; // 日本語の学部例
        $departments = ['学科', '専攻', '課程']; // 学科名などの接尾辞

        return [
            // 'user_id' は UserFactory で設定
            'school_name' => fake()->randomElement(['早稲田', '慶應義塾', '東京', '京都', '大阪', '北海道', '九州', '東北', '名古屋']) . '大学', // 日本の大学名例
            // ★ ランダムな学部名と接尾辞を組み合わせる ★
            'major' => fake()->optional(0.8)->randomElement($majors) . fake()->randomElement($departments), // 80%の確率で設定
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate?->format('Y-m-d'),
            'description' => fake()->optional(0.5)->realText(rand(100, 500)), 
        ];
    }
}