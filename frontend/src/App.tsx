 // frontend/src/App.tsx
 import { Routes, Route, Link } from 'react-router-dom';
 import Layout from '@/layouts/Layout';
 import HomePage from '@/pages/HomePage';
 import LoginPage from '@/pages/LoginPage';
 import AboutPage from '@/pages/AboutPage';
 import UsersPage from '@/pages/UsersPage';
 import UserProfilePage from '@/pages/UserProfilePage';
 import ProfileEditPage from '@/pages/ProfileEditPage'; // ★ 編集ページをインポート
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
         <Route path="users" element={<UsersPage />} />
         <Route path="users/:userId" element={<UserProfilePage />} />
+        {/* ★★★ プロフィール編集ページ ★★★ */}
+        <Route path="profile/edit" element={<ProfileEditPage />} />

         {/* 投稿関連 */}
         <Route path="posts/:postId" element={<PostDetailPage />} />

         {/* 404 Not Found */}
         <Route path="*" element={<NotFoundPage />} />
       </Route>
     </Routes>
   );
 }

 export default App;