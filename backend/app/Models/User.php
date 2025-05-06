<?php
///Users/tsukadatakahiro/Python/app/aqsh-terrace/backend/app/Models/User.php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail; // 必要に応じて
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
// ★ リレーション用のクラスをインポート ★
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
// ★ キャスト用のクラスをインポート ★
use Illuminate\Database\Eloquent\Casts\Attribute; // Attribute は直接使用されていませんが、将来的なアクセサ/ミューテタで使う可能性はあります
use Illuminate\Database\Eloquent\Casts\AsArrayObject; // または AsCollection

/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property string|null $profile_image_url
 * @property string|null $headline
 * @property string|null $location
 * @property string|null $introduction
 * @property string|null $contact_email
 * @property \ArrayObject<array-key, mixed>|null $social_links
 * @property \ArrayObject<array-key, mixed>|null $experienced_industries
 * @property \ArrayObject<array-key, mixed>|null $experienced_company_types
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Comment> $comments
 * @property-read int|null $comments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Education> $educations
 * @property-read int|null $educations_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Experience> $experiences
 * @property-read int|null $experiences_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, User> $followers
 * @property-read int|null $followers_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, User> $followings
 * @property-read int|null $followings_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $likedPosts
 * @property-read int|null $liked_posts_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PortfolioItem> $portfolioItems
 * @property-read int|null $portfolio_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $posts
 * @property-read int|null $posts_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Skill> $skills
 * @property-read int|null $skills_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereContactEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereExperiencedCompanyTypes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereExperiencedIndustries($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereHeadline($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIntroduction($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereProfileImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereSocialLinks($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class User extends Authenticatable // implements MustVerifyEmail // 必要ならコメントを外す
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * 複数代入可能な属性
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        // ★ プロフィール関連のカラムを追加 ★
        'profile_image_url',
        'headline',
        'location',
        'introduction',
        'contact_email',
        'social_links',         // JSON or TEXT
        'experienced_industries', // JSON or TEXT
        'experienced_company_types', // JSON or TEXT
        'current_company_name',
        'current_company_url',
    ];

    /**
     * シリアライズ時に非表示にする属性
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * キャストする属性
     * Get the attributes that should be cast.
     *
     * ★ casts プロパティをメソッドに変更してより柔軟に ★
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            // ★ JSON カラムを配列/オブジェクトとして扱う ★
            'social_links' => AsArrayObject::class, // または 'array'
            'experienced_industries' => AsArrayObject::class, // または 'array'
            'experienced_company_types' => AsArrayObject::class, // または 'array'
        ];
    }

    // --- リレーション定義 ---

    /**
     * ユーザーが作成した投稿を取得
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * ユーザーが作成したコメントを取得
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * ユーザーがいいねした投稿 (中間テーブル経由)
     * 注意: このリレーション名は `likes` テーブル構造に依存します。
     * もし `likes` テーブルが `user_id` と `post_id` を持つシンプルな中間テーブルならこれでOKです。
     * もし `Like` モデルが存在し、それ経由でリレーションを定義していた場合は、
     * 以前の `HasMany(Like::class)` の方が適切かもしれません。
     * または `likes` テーブルが `likeable_id`, `likeable_type` を持つポリモーフィックな場合は定義が変わります。
     */
    public function likedPosts(): BelongsToMany
    {
        // 仮に 'likes' テーブルが user_id と post_id を持つ中間テーブルであると仮定
        // 第1引数: 関連モデル (Post)
        // 第2引数: 中間テーブル名 ('likes')
        // 第3引数: 中間テーブルの自モデル (User) の外部キー ('user_id') - 省略可能 (Laravelが推測)
        // 第4引数: 中間テーブルの関連モデル (Post) の外部キー ('post_id') - 省略可能 (Laravelが推測)
        return $this->belongsToMany(Post::class, 'likes', 'user_id', 'post_id')->withTimestamps();
    }

    /**
     * ユーザーがフォローしているユーザー (中間テーブル follows)
     */
    public function followings(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')->withTimestamps();
    }

    /**
     * ユーザーをフォローしているユーザー (中間テーブル follows)
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')->withTimestamps();
    }

    /**
     * ユーザーの職務経歴を取得
     * ★ 追加 ★
     */
    public function experiences(): HasMany
    {
        // 通常は新しい順に表示することが多い
        return $this->hasMany(Experience::class)->orderBy('start_date', 'desc');
    }

    /**
     * ユーザーの学歴を取得
     * ★ 追加 ★
     */
    public function educations(): HasMany
    {
        return $this->hasMany(Education::class)->orderBy('start_date', 'desc');
    }

    /**
     * ユーザーが持つスキル (中間テーブル skill_user 経由)
     * ★ 追加 ★
     */
    public function skills(): BelongsToMany
    {
        // 中間テーブルのカラム (level, years_of_experience, description) も取得可能にする
        // 第1引数: 関連モデル (Skill)
        // 第2引数: 中間テーブル名 ('skill_user')
        // 第3引数: 中間テーブルの自モデル (User) の外部キー ('user_id') - 省略可能
        // 第4引数: 中間テーブルの関連モデル (Skill) の外部キー ('skill_id') - 省略可能
        return $this->belongsToMany(Skill::class, 'skill_user', 'user_id', 'skill_id')
                    ->withPivot('level', 'years_of_experience', 'description') // 中間テーブルの追加カラム
                    ->withTimestamps(); // 中間テーブルに timestamps があれば
    }

    /**
     * ユーザーのポートフォリオアイテムを取得
     * ★ 追加 ★
     */
    public function portfolioItems(): HasMany
    {
        // PortfolioItem モデルとのリレーション
        return $this->hasMany(PortfolioItem::class)->orderBy('created_at', 'desc'); // 例: 作成日が新しい順
    }

    // --- ヘルパーメソッド (オプション) ---

    /**
     * 特定のユーザーをフォローしているか判定するメソッド
     * (リレーションが存在するかのチェック)
     */
    public function isFollowing(User $user): bool
    {
        // followings リレーションを使って、指定したユーザーIDを持つレコードが存在するかチェック
        return $this->followings()->where('following_id', $user->id)->exists();
    }

    /**
     * 特定の投稿をいいねしているか判定するメソッド
     * (リレーションが存在するかのチェック)
     */
     public function hasLiked(Post $post): bool
     {
         // likedPosts リレーションを使って、指定した投稿IDを持つレコードが存在するかチェック
         return $this->likedPosts()->where('post_id', $post->id)->exists();
     }
}