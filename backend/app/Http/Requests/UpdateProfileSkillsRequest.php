<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Skill; // Skill モデル

class UpdateProfileSkillsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // スキルレベルの有効な値 (config から取得)
        $validSkillLevels = array_keys(config('metadata.skill_levels', []));

        return [
            // 'skills' は配列であることを期待
            'skills' => ['required', 'array', 'max:100'], // 例: 最大100スキルまで
            // 配列内の各要素に対するルール (オブジェクト形式を想定)
            'skills.*' => ['required', 'array:skill_id,level,years_of_experience,description'], // 配列のキーを指定
            // スキルID: skills テーブルに存在する ID であること
            'skills.*.skill_id' => ['required', 'integer', 'exists:skills,id'],
            // スキルレベル: config のキーに含まれる値 or null
            'skills.*.level' => ['nullable', 'integer', Rule::in($validSkillLevels)],
            // 経験年数: 0以上の整数 or null
            'skills.*.years_of_experience' => ['nullable', 'integer', 'min:0', 'max:50'], // 例: 0-50年
            // 補足説明: 文字列 or null, 最大文字数
            'skills.*.description' => ['nullable', 'string', 'max:500'],
        ];
    }

     /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'skills.*.skill_id.required' => 'スキルを選択してください。',
            'skills.*.skill_id.exists' => '選択されたスキルが無効です。',
            'skills.*.level.in' => '選択されたスキルレベルが無効です。',
            'skills.*.years_of_experience.integer' => '経験年数には数値を入力してください。',
            'skills.*.years_of_experience.min' => '経験年数は0以上で入力してください。',
        ];
    }
}