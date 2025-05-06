<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User; // user_id 用
use App\Models\Post; // post_id 用

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // ★ user_id と post_id を設定 ★
            // UserFactory の afterCreating から呼ばれる場合は上書きされる
            'user_id' => User::query()->inRandomOrder()->first()?->id ?? User::factory(),
            'post_id' => Post::query()->inRandomOrder()->first()?->id ?? Post::factory(),
            'body' => fake()->realText(rand(100, 500)),  // 短めのコメント
        ];
    }
}