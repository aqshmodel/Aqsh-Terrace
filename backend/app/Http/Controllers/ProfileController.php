<?php
//backend/app/Http/Controllers/ProfileController.php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\UserResource; // ユーザー情報用のリソース (後で作成)
use App\Http\Requests\UpdateProfileRequest; // プロフィール更新用リクエスト (後で作成)
use App\Http\Requests\UpdateProfileSkillsRequest; // スキル更新用リクエスト (後で作成)
use App\Models\Skill; // Skill モデル
use App\Http\Requests\UpdateAvatarRequest; // ★ インポート
use Illuminate\Support\Facades\Storage; // ★ Storage ファサードをインポート

class ProfileController extends Controller
{
    /**
     * ログインユーザー自身のプロフィール情報を取得する
     * GET /api/profile
     */
    public function show(Request $request)
    {
        $user = Auth::user()->load([
            'experiences', // 職務経歴
            'educations', // 学歴
            'skills', // スキル (中間テーブル情報含む)
            'portfolioItems' // ポートフォリオ
        ]);

        return new UserResource($user);
    }

    /**
     * ログインユーザー自身の基本プロフィール情報を更新する
     * PUT /api/profile
     */
    public function update(UpdateProfileRequest $request) // ★ バリデーションは Request クラスで行う
    {
        $user = Auth::user();
        $validated = $request->validated(); // バリデーション済みデータを取得

        $user->update($validated);

        // 更新後のユーザー情報を返す (リレーションは再ロードしない)
        return new UserResource($user);
    }

    /**
     * ログインユーザー自身のスキル情報を一括更新する
     * PUT /api/profile/skills
     */
    public function updateSkills(UpdateProfileSkillsRequest $request)
    {
        $user = Auth::user();
        $validatedSkills = $request->validated()['skills']; // [['skill_id' => 1, 'level' => 3, ...], ...]

        $syncData = [];
        foreach ($validatedSkills as $skillData) {
            // skill_id 以外の pivot データを整形
            $pivotData = collect($skillData)->except('skill_id')->all();
            // id が 0 や null の場合は skill_id を使わないようにする (任意: 新規スキル対応など)
            if (!empty($skillData['skill_id'])) {
                 $syncData[$skillData['skill_id']] = $pivotData;
            }
             // TODO: skill_id がなく name がある場合、Skill を検索または作成する処理 (v1.1?)
        }

        // sync メソッドで中間テーブルのデータを更新 (既存は更新、なければ追加、指定されなければ削除)
        $user->skills()->sync($syncData);

        // 更新後のスキル情報を返す (ユーザー情報全体を返すのが楽か)
        return new UserResource($user->load('skills'));
    }


    public function updateAvatar(UpdateAvatarRequest $request)
    {
        $user = Auth::user();
        $avatarFile = $request->file('avatar'); // 'avatar' は input name

        // 古いアバターがあれば削除
        if ($user->profile_image_url) {
            // URL からパスを抽出 (Storage::url() で生成されたURLを想定)
            $oldPath = str_replace(Storage::disk('public')->url(''), '', $user->profile_image_url);
            // public ディスクから削除
            if ($oldPath && Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        // 新しいアバターを保存 (例: public/avatars ディレクトリ)
        // ファイル名が衝突しないようにハッシュ名などを利用
        $path = $avatarFile->store('avatars', 'public'); // public ディスクの avatars フォルダに保存

        // DB に保存する URL を生成
        $url = Storage::disk('public')->url($path);

        // ユーザー情報を更新
        $user->forceFill([ // fillable になくても強制的に更新
            'profile_image_url' => $url,
        ])->save();

        // 更新後のユーザー情報を返す
        return new UserResource($user);
    }

    /**
     * ログインユーザーのアバター画像を削除する
     * DELETE /api/profile/avatar
     */
    public function deleteAvatar(Request $request) // Requestクラスは不要かもしれない
    {
        $user = Auth::user();

        if (!$user->profile_image_url) {
            // 既にアバターがない場合は何もしない
            return response()->json(['message' => 'アバターは設定されていません。'], 404);
        }

        // ストレージからファイルを削除
        $oldPath = str_replace(Storage::disk('public')->url(''), '', $user->profile_image_url);
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        // DB の URL を null に更新
        $user->forceFill([
            'profile_image_url' => null,
        ])->save();

        // 更新後のユーザー情報を返す (URLがnullになった状態)
        return new UserResource($user);
    }

     /**
     * ログインユーザー自身の職務経歴一覧を取得 (編集フォーム用)
     * GET /api/profile/experiences
     */
    public function experiences() {
        return response()->json(Auth::user()->experiences);
    }

    /**
     * ログインユーザー自身の学歴一覧を取得 (編集フォーム用)
     * GET /api/profile/educations
     */
    public function educations() {
        return response()->json(Auth::user()->educations);
    }

    /**
     * ログインユーザー自身のポートフォリオ一覧を取得 (編集フォーム用)
     * GET /api/profile/portfolio-items
     */
    public function portfolioItems() {
        return response()->json(Auth::user()->portfolioItems);
    }
}