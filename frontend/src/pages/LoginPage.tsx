// src/pages/LoginPage.tsx
import { useEffect } from 'react';
// Link を useNavigate と同じ行でインポートするように修正
import { Link, useNavigate } from 'react-router-dom';
// Button はフォーム内で使われていないため、不要なら削除しても良い
// import { Button } from '@/components/ui/button';
import useAuthStore from '@/stores/authStore'; // ストアをインポート
import { LoginForm } from '@/components/LoginForm'; // ログインフォームコンポーネントをインポート
// import { Link } from 'react-router-dom'; // ★ 重複していたため削除 ★
import useDocumentTitle from '@/hooks/useDocumentTitle'; // ★ カスタムフックをインポート

function LoginPage() {
  useDocumentTitle('Aqsh Terrace | ログイン'); // ★ フックを呼び出す
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn); // ログイン状態を取得

  // ログイン状態が変化したらチェック
  useEffect(() => {
    // ログイン済みであればホームページへリダイレクト
    if (isLoggedIn) {
      console.log("ログイン済みのためリダイレクトします。"); // 動作確認用ログ
      navigate('/');
    }
    // 依存配列: isLoggedIn または navigate が変更されたらこの Effect を再実行
  }, [isLoggedIn, navigate]);


  // isLoggedIn が確定する前に一瞬フォームが表示されるのを防ぐためのガード（任意）
  // if (isLoggedIn === null) { // ストアの初期値が null の場合など
  //   return <div className="p-4">読み込み中...</div>;
  // }

  // すでにログインしている場合のリダイレクト前表示
  if (isLoggedIn) {
     return <div className="p-4 text-center">すでにログインしています。<br/>ホームページにリダイレクトします...</div>;
  }
  // ログインしていない場合にフォームを表示
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
      <LoginForm />
      {/* 登録ページへのリンク */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        アカウントがありませんか？{' '}
        <Link to="/register" className="underline hover:text-primary">
          新規登録
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;