<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Skill; // Skill モデルをインポート
use Illuminate\Support\Facades\DB; // DB ファサードを使う場合

class SkillsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 既存データをクリア (任意)
        // DB::table('skills')->truncate(); // Truncate する場合は外部キー制約に注意

        $skills = [
            // 技術スキル (technical)
            ['name' => 'PHP', 'type' => 'technical', 'category' => 'プログラミング言語'],
            ['name' => 'Laravel', 'type' => 'technical', 'category' => 'フレームワーク'],
            ['name' => 'JavaScript', 'type' => 'technical', 'category' => 'プログラミング言語'],
            ['name' => 'TypeScript', 'type' => 'technical', 'category' => 'プログラミング言語'],
            ['name' => 'React', 'type' => 'technical', 'category' => 'フレームワーク/ライブラリ'],
            ['name' => 'Vue.js', 'type' => 'technical', 'category' => 'フレームワーク/ライブラリ'],
            ['name' => 'Next.js', 'type' => 'technical', 'category' => 'フレームワーク/ライブラリ'],
            ['name' => 'Node.js', 'type' => 'technical', 'category' => '実行環境'],
            ['name' => 'Python', 'type' => 'technical', 'category' => 'プログラミング言語'],
            ['name' => 'Java', 'type' => 'technical', 'category' => 'プログラミング言語'],
            ['name' => 'Go', 'type' => 'technical', 'category' => 'プログラミング言語'],
            ['name' => 'SQL', 'type' => 'technical', 'category' => 'データベース'],
            ['name' => 'MySQL', 'type' => 'technical', 'category' => 'データベース'],
            ['name' => 'PostgreSQL', 'type' => 'technical', 'category' => 'データベース'],
            ['name' => 'AWS', 'type' => 'technical', 'category' => 'クラウド'],
            ['name' => 'Docker', 'type' => 'technical', 'category' => '仮想化/コンテナ'],
            ['name' => 'Git', 'type' => 'technical', 'category' => 'バージョン管理'],
            ['name' => 'HTML', 'type' => 'technical', 'category' => 'マークアップ言語'],
            ['name' => 'CSS', 'type' => 'technical', 'category' => 'スタイルシート言語'],
            ['name' => 'Tailwind CSS', 'type' => 'technical', 'category' => 'CSSフレームワーク'],

            // ビジネス/職種スキル (business)
            ['name' => 'プロジェクトマネジメント', 'type' => 'business', 'category' => 'マネジメント'],
            ['name' => 'プロダクトマネジメント', 'type' => 'business', 'category' => 'マネジメント'],
            ['name' => 'チームマネジメント', 'type' => 'business', 'category' => 'マネジメント'],
            ['name' => '要件定義', 'type' => 'business', 'category' => '開発プロセス'],
            ['name' => '基本設計', 'type' => 'business', 'category' => '開発プロセス'],
            ['name' => 'UI/UXデザイン', 'type' => 'business', 'category' => 'デザイン'],
            ['name' => 'Webデザイン', 'type' => 'business', 'category' => 'デザイン'],
            ['name' => '法人営業', 'type' => 'business', 'category' => '営業'],
            ['name' => 'インサイドセールス', 'type' => 'business', 'category' => '営業'],
            ['name' => 'マーケティング戦略', 'type' => 'business', 'category' => 'マーケティング'],
            ['name' => 'Webマーケティング', 'type' => 'business', 'category' => 'マーケティング'],
            ['name' => 'データ分析', 'type' => 'business', 'category' => 'データ関連'],
            ['name' => '事業企画', 'type' => 'business', 'category' => '企画/戦略'],
            ['name' => '新規事業開発', 'type' => 'business', 'category' => '企画/戦略'],
            ['name' => '経理実務', 'type' => 'business', 'category' => '管理部門'],
            ['name' => '財務分析', 'type' => 'business', 'category' => '管理部門'],
            ['name' => '人事採用', 'type' => 'business', 'category' => '管理部門'],
            ['name' => '労務管理', 'type' => 'business', 'category' => '管理部門'],
            ['name' => '広報/PR', 'type' => 'business', 'category' => 'その他'],
            ['name' => 'テクニカルライティング', 'type' => 'business', 'category' => 'その他'],

            // 業界知識/経験 (industry) - 例
            ['name' => 'Webサービス業界', 'type' => 'industry'],
            ['name' => 'SaaS業界', 'type' => 'industry'],
            ['name' => 'EC業界', 'type' => 'industry'],
            ['name' => '金融業界', 'type' => 'industry'],
            ['name' => '製造業', 'type' => 'industry'],
            ['name' => '広告業界', 'type' => 'industry'],
            ['name' => '不動産業界', 'type' => 'industry'],

            // 語学スキル (language) - 例
            ['name' => '英語 (ビジネスレベル)', 'type' => 'language'],
            ['name' => '英語 (ネイティブ)', 'type' => 'language'],
            ['name' => '中国語 (ビジネスレベル)', 'type' => 'language'],

            // 資格 (qualification) - 例
            ['name' => '基本情報技術者試験', 'type' => 'qualification'],
            ['name' => '応用情報技術者試験', 'type' => 'qualification'],
            ['name' => 'PMP', 'type' => 'qualification'],
            ['name' => '簿記2級', 'type' => 'qualification'],
            ['name' => 'TOEIC 800点以上', 'type' => 'qualification'],

            // 特定業務/領域知識 (knowledge) - 例
            ['name' => 'アジャイル開発', 'type' => 'knowledge'],
            ['name' => 'スクラムマスター', 'type' => 'knowledge'],
            ['name' => 'サプライチェーン管理(SCM)', 'type' => 'knowledge'],
            ['name' => '顧客関係管理(CRM)', 'type' => 'knowledge'],

            // ソフトスキル (soft_skill) - 例 (レベル付けなどは難しいかも)
            ['name' => 'リーダーシップ', 'type' => 'soft_skill'],
            ['name' => 'コミュニケーション能力', 'type' => 'soft_skill'],
            ['name' => '問題解決能力', 'type' => 'soft_skill'],
            ['name' => '交渉力', 'type' => 'soft_skill'],
            ['name' => 'プレゼンテーション能力', 'type' => 'soft_skill'],
        ];

        // データの挿入 (upsert を使うと既存の name があれば更新、なければ挿入)
        foreach ($skills as $skill) {
            Skill::updateOrCreate(
                ['name' => $skill['name']], // 検索条件
                $skill // 挿入/更新データ
            );
        }

        // もしくは単純に insert (ただし重複エラーに注意)
        // Skill::insert($skills);

        $this->command->info('Skills table seeded!');
    }
}