<?php
// app/Providers/AppServiceProvider.php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// ★ モデルのインポート ★
use App\Models\Comment;
use App\Models\Like;
use App\Models\Post; // Policy 登録のためにインポート
use App\Models\Experience; // Policy 登録のためにインポート
use App\Models\Education; // Policy 登録のためにインポート
use App\Models\PortfolioItem; // Policy 登録のためにインポート

// ★ オブザーバーのインポート ★
use App\Observers\CommentObserver;
use App\Observers\LikeObserver;

// ★ Policy のインポート ★
use App\Policies\PostPolicy; // Policy 登録のためにインポート
use App\Policies\ExperiencePolicy; // Policy 登録のためにインポート
use App\Policies\EducationPolicy; // Policy 登録のためにインポート
use App\Policies\PortfolioItemPolicy; // Policy 登録のためにインポート

// ★ Gate ファサードのインポート ★
use Illuminate\Support\Facades\Gate;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * AuthServiceProvider がないため、ここに定義する (配列形式)
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        // モデル => ポリシークラス のマッピング
        Post::class => PostPolicy::class,
        Experience::class => ExperiencePolicy::class,
        Education::class => EducationPolicy::class,
        PortfolioItem::class => PortfolioItemPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        // アプリケーションのサービス登録処理
    }

    /**
     * Bootstrap any application services.
     *
     * アプリケーションの起動時に実行される処理
     */
    public function boot(): void
    {
        // --- 1. オブザーバーの登録 ---
        Comment::observe(CommentObserver::class);
        Like::observe(LikeObserver::class);

        // --- 2. ポリシーの登録 ---
        // $policies プロパティに定義したマッピングを登録するヘルパーメソッドを呼び出す
        $this->registerPolicies();

        // --- 3. (オプション) その他の Gate 定義 ---
        // 必要であれば、モデルに紐づかない Gate::define() などをここに記述
        // Gate::define('view-admin-dashboard', function ($user) {
        //     return $user->isAdmin(); // 例
        // });
    }

    /**
     * Register the application's policies.
     *
     * AuthServiceProvider の registerPolicies メソッドを参考に実装
     *
     * @return void
     */
    public function registerPolicies()
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }
    }
}