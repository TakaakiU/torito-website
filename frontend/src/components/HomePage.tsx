// src/components/HomePage.tsx (修正後)

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../utils/apiClient';

// 親コンポーネント(App.tsx)から受け取るPropsの型定義
interface HomePageProps {
  signOut: (() => void) | undefined;
}

// バックエンドのUserモデルに対応し、フロントエンド側の型を定義
interface DbUser {
  id: number;
  cognitoSub: string;
  email: string;
  createdAt: string;
}

export function HomePage({ signOut }: HomePageProps) {
  // stateで保持するデータの型を、事前に定義したDbUserへ変更
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // コンポーネントがマウントされた時に一度だけ実行
  useEffect(() => {
    const getMyData = async () => {
      try {
        // APIエンドポイントの呼び出し
        const data: DbUser = await fetchWithAuth('/api/users/me');
        setDbUser(data);
        console.log('Successfully fetched DB user data:', data);
      } catch (e) {
        // API呼び出しに失敗した場合の処理
        if (e instanceof Error) {
          setError(e.message);
        }
        console.error('Failed to fetch data from protected API:', e);
      }
    };

    getMyData();
  }, []); // 第2引数の配列が空のため、初回レンダリング時に1度だけ実行

  return (
    <div className="homepage-container">
      <h1 className="homepage-heading">Welcome Back</h1>
      <p className="homepage-subheading">
        {dbUser?.email || 'Loading...'}
      </p>
      
      <button className="signout-button" onClick={signOut}>
        Sign Out
      </button>

      {/* エラーまたはデバッグ情報の表示エリア */}
      {error && (
        <p style={{ color: '#ff6b6b', marginTop: '2rem' }}>
          Error: {error}
        </p>
      )}
      {dbUser && (
        <p style={{ color: '#555', marginTop: '2rem', fontSize: '0.8rem' }}>
          (DB User ID: {dbUser.id})
        </p>
      )}
    </div>
  );
}