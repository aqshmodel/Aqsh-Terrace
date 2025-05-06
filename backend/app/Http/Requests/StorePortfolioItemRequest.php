<?php
//backend/app/Http/Requests/StorePortfolioItemRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth; // 必要に応じて

class StorePortfolioItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * ログインユーザーが自身のポートフォリオを追加するので、通常は true で良い。
     */
    public function authorize(): bool
    {
        return true; // または Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'url:http,https', 'max:2048'], // 有効なURL形式
            'description' => ['nullable', 'string', 'max:65535'], // TEXT想定
            // 'thumbnail_url' は v1.1 以降でファイルアップロード処理と共に追加
            // 'thumbnail' => ['nullable', 'image', 'max:2048'] // 例: 画像ファイルの場合
        ];
    }

    /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'title.required' => 'タイトルは必須です。',
            'url.url' => '有効な URL を入力してください。',
            'url.max' => 'URL は 2048 文字以内で入力してください。',
            // 'thumbnail.image' => '画像ファイルをアップロードしてください。',
            // 'thumbnail.max' => '画像サイズは 2MB 以内にする必要があります。',
        ];
    }

    /**
     * バリデーション前にデータを準備する (任意)
     * 例えば、URLの前後に不要な空白があれば除去するなど
     */
    // protected function prepareForValidation(): void
    // {
    //     if ($this->has('url')) {
    //         $this->merge([
    //             'url' => trim($this->url),
    //         ]);
    //     }
    // }
}