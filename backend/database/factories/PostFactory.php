<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User; // user_id を設定するために必要

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // ★ user_id を設定: 存在するユーザーからランダムに選ぶか、なければ作成する ★
            // UserFactory の afterCreating から呼ばれる場合は上書きされる
            'user_id' => User::query()->inRandomOrder()->first()?->id ?? User::factory(),
            'body' => fake()->realText(rand(50, 400)), // リアルなテキストを生成
            // created_at, updated_at は自動で設定される
        ];
    }
}