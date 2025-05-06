<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_likes_table.php

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
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            // ★ ユーザーへの外部キー制約 ★
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // ★ 投稿への外部キー制約 ★
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->timestamps(); // created_at と updated_at

            // ★ ユニーク制約: 同じユーザーは同じ投稿に1回しかいいねできない ★
            $table->unique(['user_id', 'post_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};