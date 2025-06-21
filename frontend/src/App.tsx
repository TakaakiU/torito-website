// frontend/src/App.tsx (修正後の最終版)

import { useEffect, useState } from 'react';
import './App.css';
// 先ほど作成した型定義をインポート
import type { InnDetail } from './types/toritoTypes';

function App() {
  // stateの型をInnDetailに変更。初期値はnull
  const [innData, setInnData] = useState<InnDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchInnDetail = async () => {
      if (!apiBaseUrl) {
        setError("APIのURLが設定されていません。");
        setLoading(false);
        return;
      }

      try {
        // 新しいAPIエンドポイントを呼び出す (今回はID:1を写し)
        const response = await fetch(`${apiBaseUrl}/api/inns/1`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`APIリクエストに失敗しました: ${response.status} ${errorText}`);
        }

        const data: InnDetail = await response.json();
        setInnData(data);
      } catch (e) {
        console.error("宿情報の取得に失敗しました:", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("不明なエラーが発生しました。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInnDetail();
  }, [apiBaseUrl]);

  const renderInnDetail = () => {
    if (!innData) return null;

    return (
      <div className="inn-detail">
        <h1>{innData.name}</h1>
        <p className="area">エリア: {innData.area}</p>
        <p className="description">{innData.description}</p>

        <hr />

        <h2>クチコミ ({innData.reviews.length}件)</h2>
        <div className="reviews-container">
          {innData.reviews.length > 0 ? (
            innData.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <p><strong>{review.userName}</strong>さん (評価: {review.rating} / 5)</p>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p>この宿にはまだクチコミがありません。</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        {loading && <p>宿の情報を読み込んでいます...</p>}
        {error && <p style={{ color: 'red' }}>エラー: {error}</p>}
        {!loading && !error && renderInnDetail()}
      </header>
    </div>
  );
}

export default App;