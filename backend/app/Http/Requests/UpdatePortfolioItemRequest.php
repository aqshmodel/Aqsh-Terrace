<?php

namespace App\Http\Requests;

// use App\Models\PortfolioItem; // 認可で使う場合
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdatePortfolioItemRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Policy でチェックするため、ここでは true でも良い。
     */
    public function authorize(): bool
    {
        // $portfolioItem = $this->route('portfolio_item'); // ルートパラメータ名に合わせる
        // return $portfolioItem && Auth::user()->can('update', $portfolioItem);
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * Store とほぼ同じルールだが、'sometimes' を付ける。
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'url:http,https', 'max:2048'],
            'description' => ['nullable', 'string', 'max:65535'],
            // 'thumbnail_url' の更新処理は v1.1 以降
        ];
    }

    /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     * Store と同じメッセージを再利用可能
     */
    public function messages(): array
    {
         // StorePortfolioItemRequest の messages() を再利用
         // return (new StorePortfolioItemRequest())->messages();

         return [
             'title.required' => 'タイトルは必須です。',
             'url.url' => '有効な URL を入力してください。',
             'url.max' => 'URL は 2048 文字以内で入力してください。',
         ];
    }

    /**
     * バリデーション前にデータを準備する (任意)
     * Store と同じロジック
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