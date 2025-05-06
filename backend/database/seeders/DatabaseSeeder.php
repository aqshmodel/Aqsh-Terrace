<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash; // 特定ユーザーのパスワード設定用

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // --- 特定のテストユーザーを作成 ---
        User::updateOrCreate( // ★ モデルに対して直接 updateOrCreate を呼び出す ★
            [
             'name' => '塚田 崇博',
             'email' => 'tsukada-t@aqsh.co.jp',
             'password' => Hash::make('ttgl37tt'), // パスワードは 'password'
             // 必要なら他のプロフィール情報も指定
             'headline' => 'Aqsh株式会社 代表取締役 | Web Developer | Laravel & React',
             'location' => '岩手県八幡平市',
             'experienced_industries' => ['it_communication', 'web_service'],
        ]);


        // --- 他の Seeder の呼び出し ---
        $this->call([
            SkillsTableSeeder::class,
            // 必要なら PostSeeder, CommentSeeder なども作成して呼び出す
        ]);
        // --- ダミーユーザーを複数作成 (例: 20人) ---
        try {
             // afterCreating が定義されているので、関連データも生成される
             User::factory()->count(20)->create();
        } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
             $this->command->warn('Some dummy users could not be created due to unique constraints (email).');
        }

         $this->command->info('Database seeded!');
    }
}