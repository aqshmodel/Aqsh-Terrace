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
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // users テーブルへの FK とカスケード削除
            $table->string('company_name');
            $table->string('position'); // 役職
            $table->date('start_date'); // 開始年月
            $table->date('end_date')->nullable(); // 終了年月 (在職中は NULL)
            $table->string('industry')->nullable(); // 業界
            $table->string('company_size')->nullable(); // 企業規模 (例: '1-10', '11-50' など)
            $table->text('description')->nullable(); // 業務内容、成果、会社の強みなど
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};