<?php
//Users/tsukadatakahiro/Python/app/aqsh-terrace/backend/app/Http/Requests/UpdateExperienceRequest.php
namespace App\Http\Requests;

// use App\Models\Experience; // 認可で使う場合
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Models\Experience; // Experience モデルをインポート

class UpdateExperienceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     * Policy でチェックするので、ここでは単純に true でも良い
     */
    public function authorize(): bool
    {
        // $experience = $this->route('experience'); // ルートから Experience モデルを取得
        // return $experience && Auth::user()->can('update', $experience);
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     * Store と同じルールを使うことが多い
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
         // StoreExperienceRequest の rules() を再利用するなども可能
         // return (new StoreExperienceRequest())->rules();

        $validIndustries = array_keys(config('metadata.industries', []));
        $validCompanySizes = array_keys(config('metadata.company_sizes', []));

        return [
            'company_name' => ['required', 'string', 'max:255'],
            'position' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'], // ★ 'date' ルールに変更
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'], // ★ 'date' ルールに変更
            'industry' => ['nullable', 'string', \Illuminate\Validation\Rule::in($validIndustries)],
            'company_size' => ['nullable', 'string', \Illuminate\Validation\Rule::in($validCompanySizes)],
            'description' => ['nullable', 'string', 'max:65535'],
        ];
    }

     /**
     * バリデーション前にデータを準備する (任意)
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