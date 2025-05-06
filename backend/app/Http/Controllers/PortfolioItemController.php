<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem; // PortfolioItem モデルをインポート
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\StorePortfolioItemRequest; // ★ 必要: 後で作成 ★
use App\Http\Requests\UpdatePortfolioItemRequest; // ★ 必要: 後で作成 ★
use App\Http\Resources\PortfolioItemResource; // ★ 必要: 後で作成 ★

class PortfolioItemController extends Controller
{
    /**
     * Display a listing of the resource.
     * (ログインユーザーのポートフォリオ一覧を返す想定)
     * GET /api/profile/portfolio-items (ProfileController に移譲しても良い)
     */
    public function index()
    {
        // ProfileController@portfolioItems を使うか、ここで実装するか選択
        // return response()->json(Auth::user()->portfolioItems);
         return PortfolioItemResource::collection(Auth::user()->portfolioItems()->orderBy('created_at', 'desc')->get());
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/profile/portfolio-items
     */
    public function store(StorePortfolioItemRequest $request) // ★ StorePortfolioItemRequest を使用 ★
    {
        $validated = $request->validated();

        // ログインユーザーに紐付けて作成
        // TODO: thumbnail_url の処理 (ファイルアップロードなど) は v1.1 以降で実装
        $portfolioItem = Auth::user()->portfolioItems()->create($validated);

        // 作成されたリソースを返す (ステータスコード 201)
        return (new PortfolioItemResource($portfolioItem))
                ->response()
                ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     * GET /api/portfolio-items/{portfolio_item} (個別表示はあまり使わない想定)
     */
    public function show(PortfolioItem $portfolioItem) // ルートモデルバインディング名をケバブケースに合わせる
    {
        // 認可: 自分のポートフォリオかチェック
        $this->authorize('view', $portfolioItem); // ★ PortfolioItemPolicy が必要 ★

        return new PortfolioItemResource($portfolioItem);
    }

    /**
     * Update the specified resource in storage.
     * PUT /api/profile/portfolio-items/{portfolio_item}
     */
    public function update(UpdatePortfolioItemRequest $request, PortfolioItem $portfolioItem) // ★ UpdatePortfolioItemRequest を使用 ★
    {
        // 認可: 自分のポートフォリオかチェック
        $this->authorize('update', $portfolioItem); // ★ PortfolioItemPolicy が必要 ★

        $validated = $request->validated();
        // TODO: thumbnail_url の処理
        $portfolioItem->update($validated);

        // 更新されたリソースを返す
        return new PortfolioItemResource($portfolioItem);
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/profile/portfolio-items/{portfolio_item}
     */
    public function destroy(PortfolioItem $portfolioItem)
    {
        // 認可: 自分のポートフォリオかチェック
        $this->authorize('delete', $portfolioItem); // ★ PortfolioItemPolicy が必要 ★

        // TODO: thumbnail_url に紐づくファイルストレージの削除処理 (v1.1 以降)

        $portfolioItem->delete();

        // 成功レスポンス (No Content)
        return response()->json(null, 204);
    }
}