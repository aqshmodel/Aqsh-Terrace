<?php
// app/Models/Like.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // ★ BelongsTo をインポート ★

/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property int $post_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Post $post
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like wherePostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Like whereUserId($value)
 * @mixin \Eloquent
 */
class Like extends Model
{
    use HasFactory;

    // ★ 複数代入可能な属性 (念のため) ★
    protected $fillable = [
        'user_id',
        'post_id',
    ];

    // ★ Like は User に属する (多対1) ★
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ★ Like は Post に属する (多対1) ★
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}