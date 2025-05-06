// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // 前に追加したボタンを再利用
import { PostForm } from "@/components/PostForm"; // PostForm をインポート
import { PostList } from "@/components/PostList"; // PostList をインポート
import useAuthStore from "@/stores/authStore"; // ログイン状態を確認するため
import useDocumentTitle from '@/hooks/useDocumentTitle'; // ★ カスタムフックをインポート

function HomePage() {
  useDocumentTitle('Aqsh Terrace | ホーム'); // ★ フックを呼び出す
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <div className="p-4 space-y-8"> {/* space-y で要素間の間隔を調整 */}
      <h1 className="text-2xl font-bold">Post</h1>

      {/* ログインしている場合にのみ投稿フォームを表示 */}
      {isLoggedIn ? (
        <PostForm />
      ) : (
        <p className="text-muted-foreground">投稿するには<a href="/login" className="underline hover:text-primary">ログイン</a>してください。</p>
      )}

      {/* 投稿一覧を表示 */}
      <PostList />

      {/* 以前のナビゲーションボタンは削除またはコメントアウト */}
      {/*
      <div className="space-x-2">
        <Button asChild><Link to="/login">...</Link></Button>
        ...
      </div>
      */}
    </div>
  );
}

export default HomePage;