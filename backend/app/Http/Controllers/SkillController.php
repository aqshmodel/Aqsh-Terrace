<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    /**
     * Display a listing of the skills based on query.
     * GET /api/skills?query={keyword}&type={type}
     */
    public function index(Request $request)
    {
        $query = Skill::query();

        if ($request->has('query') && $request->query('query') !== '') {
            $keyword = $request->query('query');
            // 部分一致検索 (name カラム)
            $query->where('name', 'like', "%{$keyword}%");
        }

        if ($request->has('type') && $request->query('type') !== '') {
            $type = $request->query('type');
            $query->where('type', $type);
        }

        // 検索結果を制限 (例: 最大20件)
        $skills = $query->limit(20)->get(['id', 'name', 'type', 'category']); // 必要なカラムのみ取得

        return response()->json($skills);
    }
}