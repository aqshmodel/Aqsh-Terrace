<?php

namespace App\Http\Requests;

// use App\Models\Education; // 認可で使う場合
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateEducationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Policy でチェックするため、ここでは true でも良い。
     */
    public function authorize(): bool
    {
        // $education = $this->route('education'); // ルートから Education モデルを取得
        // return $education && Auth::user()->can('update', $education);
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * Store とほぼ同じルールだが、'sometimes' を付けて更新しない項目はバリデーションしないようにする。
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'school_name' => ['sometimes', 'required', 'string', 'max:255'],
            'major' => ['nullable', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date_format:Y-m'],
            'end_date' => ['nullable', 'date_format:Y-m', 'after_or_equal:start_date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * バリデーション前にデータを準備する (任意)
     * Store と同じロジック
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('start_date') && preg_match('/^\d{4}-\d{2}$/', $this->start_date)) {
            $this->merge(['start_date' => $this->start_date . '-01']);
        }
        if ($this->filled('end_date') && preg_match('/^\d{4}-\d{2}$/', $this->end_date)) {
            $this->merge(['end_date' => $this->end_date . '-01']);
        } elseif ($this->has('end_date') && $this->end_date === '') {
             $this->merge(['end_date' => null]);
        }
    }

    /**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     * Store と同じメッセージを再利用可能
     */
     public function messages(): array
     {
         // StoreEducationRequest の messages() を再利用
         // return (new StoreEducationRequest())->messages();

         return [
             'start_date.required' => '開始年月は必須です。',
             'start_date.date_format' => '開始年月は YYYY-MM 形式で入力してください。',
             'end_date.date_format' => '終了年月は YYYY-MM 形式で入力してください。',
             'end_date.after_or_equal' => '終了年月は開始年月以降の日付を入力してください。',
         ];
     }
}