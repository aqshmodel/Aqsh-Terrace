<?php
///Users/tsukadatakahiro/Python/app/aqsh-terrace/backend/app/Http/Controllers/ExperienceController.php
namespace App\Http\Controllers;

use App\Models\Experience;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StoreExperienceRequest; // 後で作成
use App\Http\Requests\UpdateExperienceRequest; // 後で作成
use App\Http\Resources\ExperienceResource; // 後で作成

class ExperienceController extends Controller
{
    /**
     * Display a listing of the resource. (今回は使わない想定)
     */
    public function index()
    {
        // ユーザーモデルのリレーションを経由して取得 (orderBy はモデル側で定義済み想定)
        return ExperienceResource::collection(Auth::user()->experiences()->get());
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/profile/experiences
     */
    public function store(StoreExperienceRequest $request)
    {
        $validated = $request->validated();
        // ログインユーザーに紐付けて作成
        $experience = Auth::user()->experiences()->create($validated);

        // 201 Created レスポンスと共にリソースを返す
        return (new ExperienceResource($experience))
                ->response()
                ->setStatusCode(201);
    }

    /**
     * Display the specified resource. (個別表示もあまり使わないかも)
     */
    public function show(Experience $experience)
    {
         // 認可: 自分の経歴かチェック
         $this->authorize('view', $experience); // ★ ExperiencePolicy が必要 ★
        return new ExperienceResource($experience);
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/profile/experiences/{experience}
     */
    public function update(UpdateExperienceRequest $request, Experience $experience)
    {
         // 認可: 自分の経歴かチェック
         $this->authorize('update', $experience); // ★ ExperiencePolicy が必要 ★

        $validated = $request->validated();
        $experience->update($validated);

        return new ExperienceResource($experience->fresh()); // fresh() で最新の状態を取得
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/profile/experiences/{experience}
     */
    public function destroy(Experience $experience)
    {
         // 認可: 自分の経歴かチェック
         $this->authorize('delete', $experience); // ★ ExperiencePolicy が必要 ★

        $experience->delete();

        return response()->json(null, 204); // No Content
    }
}