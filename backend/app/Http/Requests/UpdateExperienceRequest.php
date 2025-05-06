<?php

namespace App\Http\Requests;

// use App\Models\Experience; // 認可で使う場合
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

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
            'company_name' => ['sometimes', 'required', 'string', 'max:255'], // sometimes: 値が存在する場合のみバリデーション
            'position' => ['sometimes', 'required', 'string', 'max:255'],
            'start_date' => ['sometimes', 'required', 'date_format:Y-m'],
            'end_date' => ['nullable', 'date_format:Y-m', 'after_or_equal:start_date'],
            'industry' => ['nullable', 'string', Rule::in($validIndustries)],
            'company_size' => ['nullable', 'string', Rule::in($validCompanySizes)],
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
}