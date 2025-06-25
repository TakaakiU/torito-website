// src/components/InnListPage.tsx

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ページ遷移用のLinkコンポーネント
import { fetchWithAuth } from '../utils/apiClient';

// 宿データの型定義
interface Inn {
    id: number;
    name: string;
    area: string;
    description: string;
}

export function InnListPage() {
    const [inns, setInns] = useState<Inn[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInns = async () => {
            try {
                const data = await fetchWithAuth('/api/inns');
                setInns(data);
            } catch (error) {
                console.error("宿一覧の取得に失敗しました:", error);
            } finally {
                setLoading(false);
            }
        };
        getInns();
    }, []);

    if (loading) {
        return <div>読み込み中...</div>;
    }

    return (
        <div className="page-container">
            <h1 className="page-heading">宿一覧</h1>
            <div className="inn-list">
                {inns.map(inn => (
                    // Linkコンポーネントで詳細ページへのリンクを作成
                    <Link to={`/inns/${inn.id}`} key={inn.id} className="inn-card-link">
                        <div className="inn-card">
                            <h2 className="inn-card-name">{inn.name}</h2>
                            <p className="inn-card-area">{inn.area}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
