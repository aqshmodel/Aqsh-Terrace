<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MetadataController extends Controller
{
    /**
     * Handle the incoming request.
     * GET /api/metadata
     */
    public function __invoke(Request $request)
    {
        // config/metadata.php の内容を返す
        return response()->json([
            'industries' => config('metadata.industries', []),
            'company_types' => config('metadata.company_types', []),
            'company_sizes' => config('metadata.company_sizes', []),
            'skill_types' => config('metadata.skill_types', []),
            'skill_levels' => config('metadata.skill_levels', []),
        ]);
    }
}