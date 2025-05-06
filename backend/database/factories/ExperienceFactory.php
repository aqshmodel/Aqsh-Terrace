<?php
namespace Database\Factories;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User; // User モデルが必要な場合

class ExperienceFactory extends Factory
{
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-10 years', '-1 year');
        $endDate = fake()->optional(0.8)->dateTimeBetween($startDate, 'now');

        // config から industries, company_sizes, job_titles のキー配列を取得
        $industryKeys = array_keys(config('metadata.industries', []));
        $companySizeKeys = array_keys(config('metadata.company_sizes', []));
        // ★ job_titles の表示ラベル (値) を取得 ★
        $jobTitles = array_values(config('metadata.job_titles', []));
        
        return [
            // user_id は後で紐付けるのでここでは不要
            'company_name' => fake()->company(),
            'position' => count($jobTitles) > 0 ? fake()->randomElement($jobTitles) : '担当者', // 配列が空でないことを確認
            'start_date' => $startDate->format('Y-m-d'), // Date 型で保存
            'end_date' => $endDate?->format('Y-m-d'), // null の可能性あり
            'industry' => count($industryKeys) > 0 ? fake()->randomElement($industryKeys) : null,
            'company_size' => count($companySizeKeys) > 0 ? fake()->randomElement($companySizeKeys) : null,
            'description' => fake()->realText(rand(100, 500)), 
        ];
    }
}