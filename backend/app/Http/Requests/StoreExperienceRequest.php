<?php
///Users/tsukadatakahiro/Python/app/aqsh-terrace/backend/app/Http/Requests/StoreExperienceRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Experience; // Experience モデルをインポート

class StoreExperienceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * ログインユーザーが作成するので常に true
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
        $validIndustries = array_keys(config('metadata.industries', []));
        $validCompanySizes = array_keys(config('metadata.company_sizes', []));

        return [
            'company_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'], // ★ 'date' ルールに変更
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'], // ★ 'date' ルールに変更
            'industry' => ['nullable', 'string', Rule::in($validIndustries)],
            'company_size' => ['nullable', 'string', Rule::in($validCompanySizes)],
            'description' => ['nullable', 'string', 'max:65535'],
        ];
    }

    /**
     * バリデーション前にデータを準備する (任意)
     * 例えば、'YYYY-MM' 形式で来た日付を 'YYYY-MM-01' に変換するなど
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('start_date') && preg_match('/^\d{4}-\d{2}$/', $this->start_date)) {
            $this->merge(['start_date' => $this->start_date . '-01']);
        }
        if ($this->has('end_date') && preg_match('/^\d{4}-\d{2}$/', $this->end_date)) {
             $this->merge(['end_date' => $this->end_date . '-01']);
        }
    }


/**
     * バリデーションエラーメッセージをカスタマイズ (任意)
     */
    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => '終了年月は開始年月以降に設定してください。',
            'industry.in' => '選択された業界が無効です。',
            'company_size.in' => '選択された企業規模が無効です。',
        ];
    }
}