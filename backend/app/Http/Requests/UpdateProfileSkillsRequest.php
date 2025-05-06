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
        return true; // ログインユーザー自身の操作
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
            // 'skills' キーの値は配列であることを要求
            'skills' => ['required', 'array', 'max:50'], // 最大50スキルまでなど
            // 配列 'skills' の各要素 (*) は配列であることを要求
            'skills.*' => ['required', 'array'],
            // 各スキル配列内の 'skill_id' は必須、skills テーブルに存在すること
            // TODO: 新規スキル追加を許可する場合はルール変更が必要 (例: 'nullable', 'exists:skills,id' or 'required_without:skills.*.name')
            'skills.*.skill_id' => ['required', 'integer', 'distinct', Rule::exists('skills', 'id')], // distinct で重複 ID を禁止
             // TODO: 新規スキル名を受け付ける場合
            // 'skills.*.name' => ['required_without:skills.*.skill_id', 'string', 'max:255', Rule::unique('skills', 'name')],
            // 'level' は任意だが、存在する場合は有効な値かチェック
            'skills.*.level' => ['nullable', 'integer', Rule::in($validSkillLevels)],
            // 'years_of_experience' は任意だが、存在する場合は整数かチェック (0以上など)
            'skills.*.years_of_experience' => ['nullable', 'integer', 'min:0', 'max:99'],
            // 'description' は任意だが、存在する場合は文字列かチェック
            'skills.*.description' => ['nullable', 'string', 'max:1000'],
        ];
    }

     /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'skills.*.skill_id.required' => 'スキルを選択してください。',
            'skills.*.skill_id.exists' => '選択されたスキルが存在しません。',
            'skills.*.skill_id.distinct' => '同じスキルを複数選択することはできません。',
            'skills.*.level.in' => 'スキルレベルの値が無効です。',
            'skills.*.years_of_experience.min' => '経験年数は0以上で入力してください。',
        ];
    }
}