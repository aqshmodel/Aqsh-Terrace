<?php
// database/migrations/YYYY_MM_DD_HHMMSS_create_comments_table.php

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
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            // ★ どの投稿に対するコメントか (posts テーブルへの外部キー) ★
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            // ★ どのユーザーがコメントしたか (users テーブルへの外部キー) ★
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // ★ コメント本文 ★
            $table->text('body');
            $table->timestamps(); // created_at と updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};