<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource; // UserResource をインポート
use Illuminate\Support\Facades\Log;    // Log ファサードをインポート
use App\Models\Education;             // Education モデルをインポート
use App\Http\Resources\PostResource; // ★ PostResource をインポート ★
use Illuminate\Support\Facades\Auth;  // ★ Auth ファサードをインポート ★

class UserController extends Controller
{
    /**
     * Display the specified user profile.
     * GET /api/users/{user}
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\User $user ルートモデルバインディングで User インスタンスを受け取る
     * @return \App\Http\Resources\UserResource|\Illuminate\Http\JsonResponse
     */

    public function index(Request $request) // ★ index メソッド追加 ★
    {
        // ページネーションでユーザーを取得
        // 必要なカラムを選択し、関連カウントも取得
        $users = User::query()
            ->select(['id', 'name', 'profile_image_url', 'headline', 'location', 'created_at']) // 基本情報
            ->withCount(['posts', 'followers', 'followings']) // カウント情報
            ->latest() // 例: 登録が新しい順
            ->paginate($request->query('per_page', 10)); // 1ページあたり15件

        // ★ SimpleUserResource を使って Collection として返す ★
        // return SimpleUserResource::collection($users);
        // または Laravel 標準のページネーションレスポンスをそのまま返す
         return response()->json($users); // まずはこれで試し、必要なら Resource を使う
    }

    public function show(Request $request, User $user)
    {
        // ★★★ デバッグコード開始 ★★★
        // Education モデルインスタンスを作成し、Laravel が解決するテーブル名を取得
        $educationModel = new Education();
        $resolvedTableName = $educationModel->getTable();
        // ログにテーブル名を出力
        Log::debug('Resolved table name for Education model: ' . $resolvedTableName);
        // ★★★ デバッグコード終了 ★★★

        try {
            // デバッグ: リレーションロード前のユーザーIDをログ出力
            Log::debug('Attempting to load relations for user: ' . $user->id);

            // 公開プロフィールに必要なリレーションを一括でロード
            $user->load([
                'experiences',   // User モデルの experiences() メソッド
                'educations',    // User モデルの educations() メソッド (ここでエラーが発生している可能性)
                'skills',        // User モデルの skills() メソッド
                'portfolioItems',// User モデルの portfolioItems() メソッド
                // 'followers',    // 必要ならフォロワー情報もロード (Resource側で is_following 判定に使う場合)
                // 'followings',   // 必要ならフォロー中情報もロード
            ]);

            // デバッグ: リレーションロード後のユーザーIDをログ出力
            Log::debug('Successfully loaded relations for user: ' . $user->id);

            // API Resource を使ってデータを整形して返す
            return new UserResource($user);

        } catch (\Exception $e) {
            // エラーが発生した場合、詳細をログに出力
            Log::error('Error occurred in UserController@show for user ID: ' . $user->id, [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                // 'trace' => $e->getTraceAsString() // トレースは長くなるので必要に応じて有効化
            ]);

            // フロントエンドには汎用的な 500 エラーを返す
            return response()->json(['message' => 'Internal Server Error while loading user profile.'], 500);
        }
    }

    /**
     * Display the posts for the specified user.
     * GET /api/users/{user}/posts
     *
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function posts(Request $request, User $user)
    {
        try {
            $loggedInUserId = Auth::id(); // 現在ログインしているユーザーのIDを取得
            $perPage = $request->query('per_page', 15);

            // ユーザーに紐づく投稿を取得するクエリビルダ
            $postsQuery = $user->posts() // $user->posts リレーションを使用
                             ->with([
                                 'user:id,name', // 投稿者情報
                             ])
                             ->withCount('likes') // ★ いいね数をカウント (likes_count) ★
                             // ★ 認証ユーザーがいいねしたかどうかのフラグを追加 (liked_by_user) ★
                             ->withExists(['likes as liked_by_user' => function ($query) use ($loggedInUserId) {
                                 if ($loggedInUserId) {
                                     $query->where('user_id', $loggedInUserId);
                                 } else {
                                     $query->whereRaw('1 = 0'); // 未認証時は false
                                 }
                             }])
                             ->latest(); // 新しい順

            // ページネーションを実行
            $posts = $postsQuery->paginate($perPage);

            // ★★★ PostResource を使ってレスポンスを整形することを推奨 ★★★
            // これにより、PostResource で定義された liked_by_user や likes_count が
            // レスポンスに含まれるようになります。
            return PostResource::collection($posts);

            // もし PostResource を使わずに直接 JSON で返したい場合は、
            // 上記の withCount と withExists で追加された属性が
            // $posts の各アイテムに含まれているので、それでも動作するはずです。
            // return response()->json($posts); // このままでも liked_by_user と likes_count は含まれる

        } catch (\Exception $e) {
             // エラーログ
             Log::error('Error occurred in UserController@posts for user ID: ' . $user->id, [
                'message' => $e->getMessage(),
                'exception' => $e // 例外オブジェクト全体を渡すと詳細が見れる
            ]);
             // エラーレスポンス
             return response()->json(['message' => 'Failed to retrieve user posts.'], 500);
        }
    }
}