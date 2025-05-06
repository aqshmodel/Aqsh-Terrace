// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useDocumentTitle from '@/hooks/useDocumentTitle'; // ★ カスタムフックをインポート

function NotFoundPage() {
  useDocumentTitle('Aqsh Terrace | ページが見つかりませんでした'); // ★ フックを呼び出す
  return (
    <div className="p-4 text-center">
      <h1 className="text-4xl font-bold mb-4 text-destructive">404</h1>
      <p className="text-xl mb-6">ページが見つかりませんでした。</p>
      <Button asChild>
        <Link to="/">ホームページへ戻る</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;