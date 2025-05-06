<?php
//backend/app/Models/Education.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// ★ リレーション用のクラスをインポート ★
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 
 *
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Education newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Education newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Education query()
 * @mixin \Eloquent
 */
class Education extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var string
     */
    protected $table = 'educations';
    protected $fillable = [
        'user_id',
        'school_name',
        'major',
        'start_date',
        'end_date',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m',
            'end_date' => 'date:Y-m',
        ];
    }

    /**
     * この学歴を持つユーザーを取得
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}