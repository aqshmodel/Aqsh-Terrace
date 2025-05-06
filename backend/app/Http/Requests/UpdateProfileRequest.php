<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth; // 認証ユーザー取得用
use Illuminate\Validation\Rule; // Rule ファサード

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * ログインユーザー自身のプロフィール更新なので、常に true で良い
     */
    public function authorize(): bool
    {
        // return Auth::check(); // ログインしているかチェック
        return true; // コントローラー側で Auth::user() を使うのでここでは true
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = Auth::id(); // ログインユーザーID取得

        // config から選択肢のキーを取得
        $validIndustries = array_keys(config('metadata.industries', []));
        $validCompanyTypes = array_keys(config('metadata.company_types', []));

        return [
            'name' => ['required', 'string', 'max:255'],
            // email は通常変更させないことが多いが、許可する場合は unique 制約も考慮
            // 'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'headline' => ['nullable', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'introduction' => ['nullable', 'string', 'max:65535'], // TEXT 型を想定
            'contact_email' => ['nullable', 'string', 'email', 'max:255'],
            'social_links' => ['nullable', 'array'], // 値は配列であることを期待
            'social_links.github' => ['nullable', 'string', 'url:http,https', 'max:2048'], // 個別のキーに対してルール指定
            'social_links.twitter' => ['nullable', 'string', 'url:http,https', 'max:2048'],
            'social_links.linkedin' => ['nullable', 'string', 'url:http,https', 'max:2048'],
            // 必要に応じて他の SNS も追加
            'experienced_industries' => ['nullable', 'array', 'max:5'], // 経験業界 (配列, 最大5つまでなど)
            'experienced_industries.*' => ['required', 'string', Rule::in($validIndustries)], // 配列の各要素が設定値のキーに含まれるか
            'experienced_company_types' => ['nullable', 'array', 'max:3'], // 経験企業タイプ (配列, 最大3つまでなど)
            'experienced_company_types.*' => ['required', 'string', Rule::in($validCompanyTypes)], // 同上
        ];
    }

    /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'experienced_industries.*.in' => '選択された業界が無効です。',
            'experienced_company_types.*.in' => '選択された企業タイプが無効です。',
            'social_links.*.url' => ':attribute には有効な URL を入力してください。',
        ];
    }
}