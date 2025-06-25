// src/components/InnDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // URLのパラメータを取得するuseParams
import { fetchWithAuth } from '../utils/apiClient';

interface Inn {
    id: number;
    name: string;
    area: string;
    description: string;
}

export function InnDetailPage() {
    // URLから :id の部分を取得 (例: /inns/1 なら id は "1")
    const { id } = useParams<{ id: string }>();
    const [inn, setInn] = useState<Inn | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getInnDetail = async () => {
            try {
                const data = await fetchWithAuth(`/api/inns/${id}`);
                setInn(data);
            } catch (error) {
                console.error(`宿(ID: ${id})の詳細取得に失敗しました:`, error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            getInnDetail();
        }
    }, [id]); // idが変わったら再度データを取得する

    if (loading) {
        return <div>読み込み中...</div>;
    }

    if (!inn) {
        return <div>宿が見つかりませんでした。</div>;
    }

    return (
        <div className="page-container">
            <h1 className="page-heading">{inn.name}</h1>
            <p className="inn-detail-area">エリア: {inn.area}</p>
            <p className="inn-detail-description">{inn.description}</p>
            <Link to="/" className="back-link">← 一覧に戻る</Link>
        </div>
    );
}