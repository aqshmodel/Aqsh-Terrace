<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth; // 必要に応じて

class StoreEducationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * ログインユーザーが自身の学歴を追加するので、通常は true で良い。
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
            'school_name' => ['required', 'string', 'max:255'],
            'major' => ['nullable', 'string', 'max:255'], // 学部・専攻
            'start_date' => ['required', 'date_format:Y-m'], // YYYY-MM 形式を期待
            'end_date' => ['nullable', 'date_format:Y-m', 'after_or_equal:start_date'], // 開始日以降
            'description' => ['nullable', 'string', 'max:1000'], // 備考
        ];
    }

    /**
     * バリデーション前にデータを準備する (任意)
     * YYYY-MM を YYYY-MM-01 に変換
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('start_date') && preg_match('/^\d{4}-\d{2}$/', $this->start_date)) {
            $this->merge(['start_date' => $this->start_date . '-01']);
        }
        // end_date が空文字列や null の場合も考慮
        if ($this->filled('end_date') && preg_match('/^\d{4}-\d{2}$/', $this->end_date)) {
            $this->merge(['end_date' => $this->end_date . '-01']);
        } elseif ($this->has('end_date') && $this->end_date === '') {
            // 空文字列の場合は null に変換する (nullable なので)
            $this->merge(['end_date' => null]);
        }
    }

    /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'start_date.required' => '開始年月は必須です。',
            'start_date.date_format' => '開始年月は YYYY-MM 形式で入力してください。',
            'end_date.date_format' => '終了年月は YYYY-MM 形式で入力してください。',
            'end_date.after_or_equal' => '終了年月は開始年月以降の日付を入力してください。',
        ];
    }
}