<?php

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
 * @property string $company_name
 * @property string $position
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property string|null $industry
 * @property string|null $company_size
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereCompanyName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereCompanySize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereIndustry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Experience whereUserId($value)
 * @mixin \Eloquent
 */
class Experience extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id', // 通常はリレーション経由で設定するが、念のため含めることも
        'company_name',
        'position',
        'start_date',
        'end_date',
        'industry',
        'company_size',
        'description',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        // start_date と end_date は日付として扱う
        return [
            'start_date' => 'date:Y-m', // 年月までで良い場合
            'end_date' => 'date:Y-m',   // 年月までで良い場合
            // 'start_date' => 'date', // 日付まで必要な場合
            // 'end_date' => 'date',   // 日付まで必要な場合
        ];
    }

    /**
     * この職務経歴を持つユーザーを取得
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}