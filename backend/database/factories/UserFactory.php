<?php
//UserFactory.php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Experience; // ★ 関連モデルをインポート ★
use App\Models\Education;
use App\Models\Skill;
use App\Models\PortfolioItem;
use App\Models\Post;
use App\Models\Comment; // コメントも生成する場合

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $industryKeys = array_keys(config('metadata.industries', []));
        $companyTypeKeys = array_keys(config('metadata.company_types', []));

        return [
            'name' => fake()->name(), // Faker で名前を生成
            'email' => fake()->unique()->safeEmail(), // Faker でユニークなメールアドレスを生成
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'), // デフォルトパスワード 'password'
            'remember_token' => Str::random(10),

            // ★★★ プロフィール関連のダミーデータを追加 ★★★
            'profile_image_url' => 'https://picsum.photos/seed/' . fake()->randomNumber(5) . '/200', // Lorem Picsum でランダム画像
            'headline' => fake()->optional()->realText(rand(10, 100)), // 10〜100文字の見出し
            'location' => fake()->optional(1)->prefecture() . ' ' . fake()->optional(0.7)->city(), // 70%の確率で都道府県名を設定
            'introduction' => fake()->optional(0.9)->realText(rand(100, 500)), // 90%の確率で100〜300文字の日本語風テキスト
            'contact_email' => fake()->optional()->safeEmail(), // 公開用メール (optional)
            'social_links' => fake()->optional(0.8)->randomElement([ // 80%の確率でSNSリンクを設定
                json_encode(['github' => 'https://github.com/' . fake()->userName, 'twitter' => 'https://twitter.com/' . fake()->userName]),
                json_encode(['linkedin' => 'https://linkedin.com/in/' . fake()->userName]),
                null // JSON カラムは null も許容する場合
            ]),
            // 経験業界・企業タイプ (config からランダムに選択)
            'experienced_industries' => fake()->optional(0.8)->randomElements($industryKeys, rand(1, 3)),
            'experienced_company_types' => fake()->optional(0.8)->randomElements($companyTypeKeys, rand(1, 2)),
            // ★★★ ここまで追加 ★★★
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (User $user) {
            // --- 職務経歴をランダム数作成 ---
            Experience::factory()->count(rand(1, 4))->create([
                'user_id' => $user->id, // 作成されたユーザーIDを紐付け
            ]);

            // --- 学歴をランダム数作成 ---
            Education::factory()->count(rand(0, 2))->create([ // 0件の場合もあり
                'user_id' => $user->id,
            ]);

            // --- ポートフォリオをランダム数作成 ---
            PortfolioItem::factory()->count(rand(0, 5))->create([
                'user_id' => $user->id,
            ]);

            // --- スキルをランダムにいくつか紐付け ---
            $skills = Skill::query()->inRandomOrder()->limit(rand(5, 15))->get(); // スキルマスタからランダムに取得
            foreach ($skills as $skill) {
                $user->skills()->attach($skill->id, [ // attach で中間テーブルに登録
                    'level' => rand(1, 5), // レベルをランダム設定
                    'years_of_experience' => rand(0, 10), // 経験年数をランダム設定
                    'description' => fake()->optional(0.3)->sentence(), // 30%で補足説明
                ]);
            }

            // --- 投稿をランダム数作成し、コメントも付ける ---
            Post::factory()->count(rand(3, 10))->create([
                'user_id' => $user->id,
            ])->each(function (Post $post) use ($user) { // 作成した各投稿に対して処理
                // 他のユーザーも取得してコメントさせる (自分自身を除く)
                $commenters = User::where('id', '!=', $user->id)->inRandomOrder()->limit(rand(0, 5))->get();
                Comment::factory()->count(rand(0, count($commenters)))->sequence(
                     // sequence を使って commenter を順番に割り当てる
                     ...$commenters->map(fn($commenter) => ['user_id' => $commenter->id])
                )->create([
                    'post_id' => $post->id, // 作成された投稿IDを紐付け
                ]);
                 // 自分自身のコメントも少し追加 (任意)
                // Comment::factory()->count(rand(0,1))->create([
                //     'user_id' => $user->id,
                //     'post_id' => $post->id,
                // ]);
            });

        });
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}