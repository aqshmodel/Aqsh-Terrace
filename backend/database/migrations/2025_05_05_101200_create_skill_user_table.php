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
        Schema::create('skill_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('skill_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('level')->nullable(); // スキルレベル (1-5 など)
            $table->unsignedTinyInteger('years_of_experience')->nullable(); // 経験年数
            $table->text('description')->nullable(); // スキルに関する補足説明
            $table->timestamps(); // 任意: スキル追加日時など

            // user_id と skill_id の組み合わせでユニーク制約
            $table->unique(['user_id', 'skill_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skill_user');
    }
};