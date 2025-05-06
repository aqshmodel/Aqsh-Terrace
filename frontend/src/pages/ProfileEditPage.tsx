// frontend/src/pages/ProfileEditPage.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Terminal } from 'lucide-react';
import useAuthStore from '@/stores/authStore'; // 認証状態を確認するためにインポート
import { Navigate } from 'react-router-dom'; // 未認証時にリダイレクトするためにインポート

function ProfileEditPage() {
    const { user, isLoading: isAuthLoading, isLoggedIn } = useAuthStore();

    // 認証状態の読み込み中
    if (isAuthLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-16 w-16 animate-spin text-muted-foreground" /></div>;
    }

    // 未認証の場合はログインページへリダイレクト
    if (!isLoggedIn || !user) {
        return <Navigate to="/login" replace />;
    }

    // --- ここからプロフィール編集フォームの実装 ---
    // TODO: プロフィール編集フォームコンポーネントをここに配置する
    // 現時点ではプレースホルダーを表示

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">プロフィール編集</h1>

            {/* 将来ここに各セクションの編集フォームが入る */}
            <Card>
                <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>あなたのアカウント情報を編集します。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertTitle>開発中</AlertTitle>
                        <AlertDescription>
                            プロフィール編集フォームは現在開発中です。
                        </AlertDescription>
                    </Alert>
                    {/* <BasicInfoForm userData={user} /> */}
                </CardContent>
            </Card>

             {/* 他のセクション (職務経歴、学歴、スキル、ポートフォリオ) の Card も同様に追加 */}
             <Card className="mt-6">
                <CardHeader><CardTitle>職務経歴</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>学歴</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>スキル</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
             <Card className="mt-6">
                <CardHeader><CardTitle>ポートフォリオ</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground italic">（開発中）</p></CardContent>
             </Card>
        </div>
    );
}

export default ProfileEditPage;