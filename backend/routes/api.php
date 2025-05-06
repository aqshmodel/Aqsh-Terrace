<?php
// backend/routes/api.php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast; // Broadcast ファサードをインポート

// --- コントローラーのインポート ---
// Auth
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
// Core Features
use App\Http\Controllers\PostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\NotificationController;
// Profile Features ★ 今回追加 ★
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\PortfolioItemController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\MetadataController;
// Resources ★ 補足: UserResource はコントローラー内で使用するため、ここでは不要 ★
// use App\Http\Resources\UserResource;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// --- 認証不要な API ---
Route::post('/register', [RegisterController::class, 'store'])->name('register'); // ルート名を付与
Route::post('/login', [LoginController::class, 'store'])->name('login'); // ルート名を付与
// --- ユーザー一覧表示 ---
Route::get('/users', [UserController::class, 'index'])->name('users.index');
// ログアウトは認証が必要な group に移動
// Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout');

// --- 認証が必要な API ---
Route::middleware('auth:sanctum')->group(function () {

    // --- 認証・現在ユーザー関連 ---
    Route::post('/logout', [LogoutController::class, 'destroy'])->name('logout'); // 認証グループ内に移動

    Route::get('/user', function (Request $request) {
        // UserResource を使って返すのが推奨
        return new \App\Http\Resources\UserResource($request->user());
    })->name('user.me'); // 自身の情報を取得するルート

    // --- 投稿関連 (CRUD) ---
    Route::apiResource('posts', PostController::class); // name: posts.index, posts.store, posts.show, posts.update, posts.destroy

    // --- コメント関連 (投稿にネスト) ---
    // index: GET /posts/{post}/comments
    // store: POST /posts/{post}/comments
    // shallow() なしの場合、 /posts/{post}/comments/{comment} は生成されない
    Route::apiResource('posts.comments', CommentController::class)
         ->only(['index', 'store']); // index, store のみ
         // name: posts.comments.index, posts.comments.store

    // --- いいね機能 ---
    Route::post('/posts/{post}/like', [LikeController::class, 'store'])->name('posts.like');
    Route::delete('/posts/{post}/like', [LikeController::class, 'destroy'])->name('posts.unlike');

    // --- フォロー機能 ---
    Route::post('/users/{user}/follow', [FollowController::class, 'store'])->name('users.follow');
    Route::delete('/users/{user}/follow', [FollowController::class, 'destroy'])->name('users.unfollow');

    // --- 通知機能 ---
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unreadCount');
    // TODO: 個別既読 API POST /notifications/{notification}/read
    // --- 他ユーザー プロフィール表示関連 ---
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/posts', [UserController::class, 'posts'])->name('users.posts');

    // --- 自身のプロフィール編集関連 --- ★ 今回のメイン追加部分 ★
    Route::prefix('profile')->name('profile.')->group(function () {
        // --- 基本情報 ---
        // GET /api/profile (自身の詳細情報 - リレーション含む)
        Route::get('/', [ProfileController::class, 'show'])->name('show');
        // PUT /api/profile (基本情報更新)
        Route::put('/', [ProfileController::class, 'update'])->name('update');

        // --- スキル ---
        // PUT /api/profile/skills (スキル一括更新)
        Route::put('/skills', [ProfileController::class, 'updateSkills'])->name('skills.update');
        // GET /api/profile/skills (現在のスキル取得 - リソース経由が推奨だが個別取得も定義可能)
        // Route::get('/skills', function(){ return \App\Http\Resources\SkillResource::collection(Auth::user()->skills); })->name('skills.index');

        // --- 職務経歴 (CRUD) ---
        // GET /api/profile/experiences (一覧取得)
        Route::get('/experiences', [ExperienceController::class, 'index'])->name('experiences.index');
        // POST /api/profile/experiences (新規作成)
        Route::post('/experiences', [ExperienceController::class, 'store'])->name('experiences.store');
        // PUT /api/profile/experiences/{experience} (更新)
        Route::put('/experiences/{experience}', [ExperienceController::class, 'update'])->name('experiences.update');
        // DELETE /api/profile/experiences/{experience} (削除)
        Route::delete('/experiences/{experience}', [ExperienceController::class, 'destroy'])->name('experiences.destroy');
        // GET /api/profile/experiences/{experience} (個別取得 - 不要ならコメントアウト)
        // Route::get('/experiences/{experience}', [ExperienceController::class, 'show'])->name('experiences.show');

        // --- 学歴 (CRUD) ---
        // GET /api/profile/educations (一覧取得)
        Route::get('/educations', [EducationController::class, 'index'])->name('educations.index');
        // POST /api/profile/educations (新規作成)
        Route::post('/educations', [EducationController::class, 'store'])->name('educations.store');
        // PUT /api/profile/educations/{education} (更新)
        Route::put('/educations/{education}', [EducationController::class, 'update'])->name('educations.update');
        // DELETE /api/profile/educations/{education} (削除)
        Route::delete('/educations/{education}', [EducationController::class, 'destroy'])->name('educations.destroy');
        // GET /api/profile/educations/{education} (個別取得 - 不要ならコメントアウト)
        // Route::get('/educations/{education}', [EducationController::class, 'show'])->name('educations.show');

        // --- ポートフォリオ (CRUD) ---
        // GET /api/profile/portfolio-items (一覧取得)
        Route::get('/portfolio-items', [PortfolioItemController::class, 'index'])->name('portfolio-items.index');
        // POST /api/profile/portfolio-items (新規作成)
        Route::post('/portfolio-items', [PortfolioItemController::class, 'store'])->name('portfolio-items.store');
        // PUT /api/profile/portfolio-items/{portfolio_item} (更新) - ルートモデルバインディング名をケバブケースに
        Route::put('/portfolio-items/{portfolio_item}', [PortfolioItemController::class, 'update'])->name('portfolio-items.update');
        // DELETE /api/profile/portfolio-items/{portfolio_item} (削除)
        Route::delete('/portfolio-items/{portfolio_item}', [PortfolioItemController::class, 'destroy'])->name('portfolio-items.destroy');
        // GET /api/profile/portfolio-items/{portfolio_item} (個別取得 - 不要ならコメントアウト)
        // Route::get('/portfolio-items/{portfolio_item}', [PortfolioItemController::class, 'show'])->name('portfolio-items.show');

    }); // End of /profile prefix group

    // --- スキルマスタ検索 --- ★ 今回追加 ★
    // GET /api/skills?query=...&type=...
    Route::get('/skills', [SkillController::class, 'index'])->name('skills.index');

    // --- メタデータ取得 --- ★ 今回追加 ★
    // GET /api/metadata
    Route::get('/metadata', MetadataController::class)->name('metadata'); // Invokable Controller

    // --- ブロードキャスト認証ルート ---
    Broadcast::routes(); // default: /broadcasting/auth

}); // End of auth:sanctum middleware group