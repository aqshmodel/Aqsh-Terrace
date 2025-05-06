<?php
// app/Http/Controllers/CommentController.php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post; // Post モデルも使用
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Notifications\CommentReceived; // ★ 通知クラスをインポート ★

class CommentController extends Controller
{
    /**
     * 特定の投稿に紐づくコメント一覧を表示する
     * (投稿IDをルートパラメータまたはリクエストパラメータで受け取る)
     */
    public function index(Request $request, Post $post) // ★ Post をルートモデルバインディングで受け取る ★
    {
        // 投稿に紐づくコメントを、ユーザー情報と共に新しい順で取得 (ページネーションも可能)
        $comments = $post->comments() // Post モデルのリレーションを使用
                         ->with('user:id,name') // コメント投稿者の情報もロード
                         ->latest() // 新しい順
                         ->paginate($request->query('per_page', 10)); // 1ページ10件 (任意)

        return response()->json($comments);
    }

    /**
     * 新しいコメントを特定の投稿に紐付けて保存する
     */
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:500'],
        ]);

        $userId = Auth::id();

        // ★ コメント作成時に投稿の所有者情報もロードしておく (N+1 防止) ★
        $post->load('user');
        $postOwner = $post->user;

        // ★ DB トランザクションを使うとより安全 (任意) ★
        // \DB::beginTransaction();
        // try {

            $comment = $post->comments()->create([
                'user_id' => $userId,
                'body' => $validated['body'],
            ]);

            // ★ 作成されたコメントのユーザー情報もロード ★
            $comment->load('user:id,name');

            // ★ 自分自身の投稿へのコメントでなければ、投稿所有者に通知を送る ★
            if ($postOwner && $postOwner->id !== $userId) {
                $postOwner->notify(new CommentReceived($comment));
            }

            // \DB::commit();
        // } catch (\Exception $e) {
        //     \DB::rollBack();
        //     // エラーハンドリング
        //     \Log::error('Comment creation or notification failed: ' . $e->getMessage());
        //     return response()->json(['message' => 'コメントの作成に失敗しました。'], 500);
        // }

        return response()->json($comment, 201); // レスポンスは作成されたコメントデータ
    }

    // show, update, destroy は今回は実装しない (必要なら追加)
    public function show(Comment $comment)
    {
        return response()->json(['message' => 'Not Implemented'], 501);
    }
    public function update(Request $request, Comment $comment)
    {
        // TODO: 認可 (自分のコメントかチェック)
        // $this->authorize('update', $comment);
        return response()->json(['message' => 'Not Implemented'], 501);
    }
    public function destroy(Comment $comment)
    {
        // TODO: 認可 (自分のコメントかチェック)
        // $this->authorize('delete', $comment);
        return response()->json(['message' => 'Not Implemented'], 501);
    }
}