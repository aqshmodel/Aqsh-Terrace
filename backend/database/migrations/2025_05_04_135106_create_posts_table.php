<?php
// database/migrations/YYYY_MM_DD_HHMMSS_create_posts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
// User モデルを外部キー制約で使用するためインポート (任意だが推奨)
// use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id(); // 主キー (Auto Increment BigInt)
            // ★ 外部キー制約: 投稿したユーザーのID (usersテーブルを参照) ★
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // 上記は以下と同じ意味 (constrained を使うと簡潔)
            // $table->unsignedBigInteger('user_id');
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // ★ 投稿内容 (例: 本文) ★
            $table->text('body'); // 長いテキスト用

            // ★ 任意: 投稿タイトル ★
            // $table->string('title')->nullable(); // タイトルが必要なら

            // ★ 任意: 画像などの添付ファイルパス ★
            // $table->string('image_path')->nullable();

            $table->timestamps(); // created_at と updated_at カラム (自動管理)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};