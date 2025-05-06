// src/pages/AboutPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useDocumentTitle from '@/hooks/useDocumentTitle'; // ★ カスタムフックをインポート

function AboutPage() {
  useDocumentTitle('Aqsh Terrace | About'); // ★ フックを呼び出す
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">About Aqsh Terrace</h1>
      <p className="mb-4">このプラットフォームについての説明ページです。</p>
      <Button asChild>
        <Link to="/">ホームページへ戻る</Link>
      </Button>
    </div>
  );
}

export default AboutPage;