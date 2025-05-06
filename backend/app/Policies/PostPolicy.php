<?php
// app/Policies/PostPolicy.php

namespace App\Policies;

use App\Models\Post;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PostPolicy
{
    /**
     * Determine whether the user can view any models.
     * (一覧表示の認可 - 今回は使用しないが例として)
     */
    // public function viewAny(User $user): bool
    // {
    //     return true; // 例: ログインしていれば誰でも見れる
    // }

    /**
     * Determine whether the user can view the model.
     * (詳細表示の認可 - 今回は使用しないが例として)
     */
    // public function view(User $user, Post $post): bool
    // {
    //     return true; // 例: ログインしていれば誰でも見れる
    // }

    /**
     * Determine whether the user can create models.
     * (作成の認可 - 今回は使用しないが例として)
     */
    // public function create(User $user): bool
    // {
    //     return true; // 例: ログインしていれば誰でも作成できる
    // }

    /**
     * ★ 投稿を更新できるか判定 ★
     * Determine whether the user can update the model.
     */
    public function update(User $user, Post $post): bool
    {
        // 投稿の user_id と、現在認証しているユーザーの ID が一致するかどうか
        return $user->id === $post->user_id;
    }

    /**
     * ★ 投稿を削除できるか判定 ★
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Post $post): bool
    {
        // 更新と同じロジック (自分の投稿のみ削除可能)
        return $user->id === $post->user_id;
    }

    /**
     * Determine whether the user can restore the model.
     * (ソフトデリート使用時の復元認可 - 今回は不要)
     */
    // public function restore(User $user, Post $post): bool
    // {
    //     //
    // }

    /**
     * Determine whether the user can permanently delete the model.
     * (ソフトデリート使用時の完全削除認可 - 今回は不要)
     */
    // public function forceDelete(User $user, Post $post): bool
    // {
    //     //
    // }
}