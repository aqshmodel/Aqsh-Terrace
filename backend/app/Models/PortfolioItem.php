<?php
//backend/app/Models/PortfolioItem.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// ★ リレーション用のクラスをインポート ★
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $url
 * @property string|null $description
 * @property string|null $thumbnail_url
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereThumbnailUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PortfolioItem whereUserId($value)
 * @mixin \Eloquent
 */
class PortfolioItem extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'title',
        'url',
        'description',
        'thumbnail_url',
    ];

    // Casts は特に必要ないかもしれないが、必要なら追加
    // protected function casts(): array { return []; }

    /**
     * このポートフォリオアイテムを持つユーザーを取得
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}