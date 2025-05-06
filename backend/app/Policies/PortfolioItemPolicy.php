<?php
//backend/app/Policies/PortfolioItemPolicy.php
namespace App\Policies;

use App\Models\PortfolioItem;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class PortfolioItemPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, PortfolioItem $portfolioitem): bool
    {
        // ログインユーザー ID と Portfolio の user_id が一致するか
        return $user->id === $portfolioitem->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, PortfolioItem $portfolioitem): bool
    {
        return $user->id === $portfolioitem->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PortfolioItem $portfolioitem): bool
    {
        return $user->id === $portfolioitem->user_id;
    }

    // 必要に応じて他のメソッド (create, viewAny など) も実装
}