// frontend/src/App.tsx
import { Routes, Route, Link } from 'react-router-dom'; // Link は Layout などで使う場合があるので残しておきます
import Layout from '@/layouts/Layout';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import AboutPage from '@/pages/AboutPage';
import UsersPage from '@/pages/UsersPage'; // 既存の UsersPage
import UserProfilePage from '@/pages/UserProfilePage'; // ★ 新しく作成した UserProfilePage をインポート ★
import NotFoundPage from '@/pages/NotFoundPage';
import RegisterPage from '@/pages/RegisterPage';
import PostDetailPage from '@/pages/PostDetailPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ホーム */}
        <Route index element={<HomePage />} />

        {/* 認証関連 */}
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />

        {/* 静的ページなど */}
        <Route path="about" element={<AboutPage />} />

        {/* ユーザー関連 */}
        {/* /users は全ユーザー一覧？ 現在の実装が不明なため残しますが、不要なら削除 */}
        <Route path="users" element={<UsersPage />} />
        {/* ★★★ ユーザープロフィールページ (動的ルート) ★★★ */}
        {/* /users/:userId の形式でアクセス */}
        <Route path="users/:userId" element={<UserProfilePage />} />
        {/* ★★★ ここまで追加 ★★★ */}

        {/* 投稿関連 */}
        <Route path="posts/:postId" element={<PostDetailPage />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;