// src/pages/AboutPage.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function AboutPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">アバウトページ</h1>
      <p className="mb-4">このプラットフォームについての説明ページです。</p>
      <Button asChild>
        <Link to="/">ホームページへ戻る</Link>
      </Button>
    </div>
  );
}

export default AboutPage;