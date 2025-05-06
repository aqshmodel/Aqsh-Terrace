<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File; // File ルールを使用

class UpdateAvatarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check(); // ログインユーザーのみ許可
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'avatar' => [
                'required', // 必須
                File::image() // 画像ファイルであること
                    ->max(2 * 1024) // 最大サイズ (例: 2MB)
                    ->dimensions(Rule::dimensions()->maxWidth(2000)->maxHeight(2000)), // 最大解像度 (任意)
                    // ->types(['jpeg', 'png', 'gif', 'webp']), // 許可する拡張子 (任意)
            ],
        ];
    }

    /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'avatar.required' => '画像ファイルを選択してください。',
            'avatar.image' => '画像ファイル形式が無効です。',
            'avatar.max' => '画像サイズは2MB以下にしてください。',
            'avatar.dimensions' => '画像の解像度が大きすぎます。',
        ];
    }
}