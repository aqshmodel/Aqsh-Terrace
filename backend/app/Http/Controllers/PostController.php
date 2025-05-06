<?php
// app/Http/Controllers/PostController.php

namespace App\Http\Controllers;

use App\Models\Post; // Post モデルをインポート
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // 認証ユーザー情報取得のため
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\PostResource; // ★ PostResource をインポート ★

class PostController extends Controller
{
    use AuthorizesRequests; // ポリシーによる認可を使用

    /**
     * 投稿一覧を表示する
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10); // 1ページあたりの表示件数
        $userId = Auth::id(); // 認証ユーザーのIDを取得 (いいね判定用)

        // 投稿を取得するクエリビルダ
        $postsQuery = Post::with([
                        'user:id,name', // 投稿者情報 (指定カラムのみ)
                     ])
                     ->withCount('likes') // ★ いいね数をカウント (likes_count) ★
                     // ★ 認証ユーザーがいいねしたかどうかのフラグを追加 (liked_by_user) ★
                     ->withExists(['likes as liked_by_user' => function ($query) use ($userId) {
                         // ユーザーIDが null の場合 (未認証時) も考慮
                         if ($userId) {
                             $query->where('user_id', $userId);
                         } else {
                             // 未認証時は必ず false になるように (実質不要だが念のため)
                             $query->whereRaw('1 = 0');
                         }
                     }])
                     ->latest(); // 新しい順にソート

        // ページネーションを実行
        $posts = $postsQuery->paginate($perPage);

        // ★ PostResource Collection を使用してレスポンスを整形して返す ★
        return PostResource::collection($posts);
    }

    /**
     * 新しい投稿を保存する
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. バリデーション
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        // 2. 認証済みユーザー ID を取得 (store は認証必須前提)
        $userId = Auth::id();
        if (!$userId) {
             // 通常、ミドルウェアでチェックされるはずだが念のため
             return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // 3. 投稿データを作成して保存
        $post = Post::create([
            'user_id' => $userId,
            'body' => $validated['body'],
        ]);

        // 4. 成功レスポンス (作成された投稿データと関連情報を Resource で整形)
        //    作成直後は likes_count: 0, liked_by_user: false となる
        $post->loadMissing('user:id,name'); // ユーザー情報をロード
        $post->likes_count = 0; // loadCount を呼ばずとも初期値は 0
        $post->liked_by_user = false; // 作成直後は false

        // ★ PostResource を使用し、201 Created ステータスで返す ★
        return (new PostResource($post))->response()->setStatusCode(201);
    }

    /**
     * 特定の投稿を表示する
     * Display the specified resource.
     */
    public function show(Post $post) // ルートモデルバインディング
    {
        $userId = Auth::id(); // 認証ユーザーIDを取得 (未認証なら null)

        // ★ リレーション、いいね数、いいね状態をロード ★
        $post->loadMissing([ // loadMissing で既にロード済みの場合は無視
            'user:id,name',
            // 必要であればコメントなどもロード
            // 'comments' => function($query) { $query->with('user:id,name')->latest(); }
        ])
        ->loadCount('likes') // likes_count をロード
        // ★ 認証ユーザーがいいねしたかどうかのフラグ (liked_by_user) をロード ★
        ->loadExists(['likes as liked_by_user' => function ($query) use ($userId) {
             if ($userId) {
                 $query->where('user_id', $userId);
             } else {
                 $query->whereRaw('1 = 0');
             }
        }]);

        // ★ PostResource を使用してレスポンスを整形して返す ★
        return new PostResource($post);
    }

    /**
     * 特定の投稿を更新する
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        // 1. 認可チェック (update ポリシー)
        $this->authorize('update', $post);

        // 2. バリデーション
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        // 3. 投稿を更新
        $post->update($validated);

        // 4. 成功レスポンス (更新後の投稿データを Resource で整形)
        //    更新操作ではいいね情報は変わらないので、再ロードは必須ではないが、
        //    show と同じ情報を返すためにロードする
        $userId = Auth::id();
        $post->loadMissing(['user:id,name'])
             ->loadCount('likes')
             ->loadExists(['likes as liked_by_user' => function ($query) use ($userId) {
                 if ($userId) {
                     $query->where('user_id', $userId);
                 } else {
                     $query->whereRaw('1 = 0');
                 }
             }]);

        // ★ PostResource を使用してレスポンスを返す ★
        return new PostResource($post);
    }

    /**
     * 特定の投稿を削除する
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        // 1. 認可チェック (delete ポリシー)
        $this->authorize('delete', $post);

        // 2. 投稿を削除
        $post->delete();

        // 3. 成功レスポンス
        return response()->noContent(); // 204 No Content
    }
}