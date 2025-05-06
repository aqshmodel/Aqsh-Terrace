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
        Schema::create('skills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // スキル名 (ユニーク制約)
            $table->string('type')->index(); // スキルタイプ (technical, business, industry, etc.) インデックス追加
            $table->string('category')->nullable()->index(); // 詳細分類 (任意) インデックス追加
            $table->timestamps(); // 任意だが、マスタデータの追加・更新履歴として有用
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};