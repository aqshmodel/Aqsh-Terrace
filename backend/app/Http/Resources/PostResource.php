<?php
// app/Http/Resources/PostResource.php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            'user' => UserResource::make($this->whenLoaded('user')),

            // ★★★ いいね情報を追加 ★★★
            // likes_count は withCount/loadCount でロードされた属性
            'likes_count' => $this->when(isset($this->likes_count), fn() => (int) $this->likes_count, 0), // ない場合は 0
            // liked_by_user は withExists/loadExists でロードされた属性
            'liked_by_user' => $this->when(isset($this->liked_by_user), fn() => (bool) $this->liked_by_user, false), // ない場合は false
            // ★★★ ここまで追加 ★★★

            // 将来的にコメント数なども追加可能
            // 'comments_count' => $this->when(isset($this->comments_count), fn() => (int) $this->comments_count, 0),
        ];
    }
}