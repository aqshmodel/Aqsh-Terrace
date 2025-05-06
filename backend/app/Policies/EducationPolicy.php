<?php
//backend/app/Policies/EducationPolicy.php
namespace App\Policies;

use App\Models\Education;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class EducationPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Education $education): bool
    {
        // ログインユーザー ID と Experience の user_id が一致するか
        return $user->id === $education->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Education $education): bool
    {
        return $user->id === $education->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Education $education): bool
    {
        return $user->id === $education->user_id;
    }

    // 必要に応じて他のメソッド (create, viewAny など) も実装
}