// src/pages/RegisterPage.tsx
import { RegisterForm } from "@/components/RegisterForm";
import { Link } from 'react-router-dom';

function RegisterPage() {
  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">ユーザー登録</h1>
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted-foreground">
        アカウントをお持ちですか？{' '}
        <Link to="/login" className="underline hover:text-primary">
          ログイン
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;