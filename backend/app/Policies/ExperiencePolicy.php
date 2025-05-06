<?php

namespace App\Policies;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class ExperiencePolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Experience $experience): bool
    {
        // ログインユーザー ID と Experience の user_id が一致するか
        return $user->id === $experience->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Experience $experience): bool
    {
        return $user->id === $experience->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Experience $experience): bool
    {
        return $user->id === $experience->user_id;
    }

    // 必要に応じて他のメソッド (create, viewAny など) も実装
}