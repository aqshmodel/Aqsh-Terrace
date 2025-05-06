<?php
// database/migrations/xxxx_xx_xx_xxxxxx_create_follows_table.php

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
        Schema::create('follows', function (Blueprint $table) {
            $table->id();
            // ★ フォローする側のユーザーID ★
            $table->foreignId('follower_id')->comment('フォローしたユーザーID')->constrained('users')->onDelete('cascade');
            // ★ フォローされる側のユーザーID ★
            $table->foreignId('following_id')->comment('フォローされたユーザーID')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // ★ ユニーク制約: 同じ組み合わせでの重複フォローを防ぐ ★
            $table->unique(['follower_id', 'following_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('follows');
    }
};