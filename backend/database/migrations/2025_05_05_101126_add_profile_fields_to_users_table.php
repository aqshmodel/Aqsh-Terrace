<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_image_url')->nullable()->after('remember_token');
            $table->string('headline')->nullable()->after('profile_image_url');
            $table->string('location')->nullable()->after('headline');
            $table->text('introduction')->nullable()->after('location');
            $table->string('contact_email')->nullable()->after('introduction'); // 公開用メール
            $table->json('social_links')->nullable()->after('contact_email'); // 例: {"github": "url", "twitter": "url"}
            $table->json('experienced_industries')->nullable()->after('social_links'); // 例: ["IT", "製造業"]
            $table->json('experienced_company_types')->nullable()->after('experienced_industries'); // 例: ["スタートアップ", "大企業"]
            // 将来用: 公開範囲設定
            // $table->enum('profile_visibility', ['public', 'followers_only', 'private'])->default('public')->after('experienced_company_types');
            // $table->enum('contact_visibility', ['public', 'followers_only', 'private'])->default('public')->after('profile_visibility');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // down メソッドでは追加したカラムを削除する
            $table->dropColumn([
                'profile_image_url',
                'headline',
                'location',
                'introduction',
                'contact_email',
                'social_links',
                'experienced_industries',
                'experienced_company_types',
                // 'profile_visibility',
                // 'contact_visibility',
            ]);
        });
    }
};