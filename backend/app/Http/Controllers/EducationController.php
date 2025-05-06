<?php

namespace App\Http\Controllers;

use App\Models\Education; // Education モデルをインポート
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreEducationRequest; // ★ 必要: 後で作成 ★
use App\Http\Requests\UpdateEducationRequest; // ★ 必要: 後で作成 ★
use App\Http\Resources\EducationResource; // ★ 必要: 後で作成 ★

class EducationController extends Controller
{
    /**
     * Display a listing of the resource.
     * (ログインユーザーの学歴一覧を返す想定)
     * GET /api/profile/educations (ProfileController に移譲しても良い)
     */
    public function index()
    {
        // ProfileController@educations を使うか、ここで実装するか選択
        // return response()->json(Auth::user()->educations);
        return EducationResource::collection(Auth::user()->educations()->orderBy('start_date', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/profile/educations
     */
    public function store(StoreEducationRequest $request) // ★ StoreEducationRequest を使用 ★
    {
        $validated = $request->validated();

        // ログインユーザーに紐付けて作成
        $education = Auth::user()->educations()->create($validated);

        // 作成されたリソースを返す (ステータスコード 201)
        return (new EducationResource($education))
                ->response()
                ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     * GET /api/educations/{education} (個別表示はあまり使わない想定)
     */
    public function show(Education $education)
    {
        // 認可: 自分の学歴かチェック
        $this->authorize('view', $education); // ★ EducationPolicy が必要 ★

        return new EducationResource($education);
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/profile/educations/{education}
     */
    public function update(UpdateEducationRequest $request, Education $education) // ★ UpdateEducationRequest を使用 ★
    {
        // 認可: 自分の学歴かチェック
        $this->authorize('update', $education); // ★ EducationPolicy が必要 ★

        $validated = $request->validated();
        $education->update($validated);

        // 更新されたリソースを返す
        return new EducationResource($education);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/profile/educations/{education}
     */
    public function destroy(Education $education)
    {
        // 認可: 自分の学歴かチェック
        $this->authorize('delete', $education); // ★ EducationPolicy が必要 ★

        $education->delete();

        // 成功レスポンス (No Content)
        return response()->json(null, 204);
    }
}