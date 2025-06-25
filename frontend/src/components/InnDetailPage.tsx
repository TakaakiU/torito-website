// src/components/InnDetailPage.tsx
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchWithAuth } from '../utils/apiClient';

// --- 型定義 ---
interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
    postedAt: string;
}

interface Inn {
    id: number;
    name: string;
    area: string;
    description: string;
    reviews: Review[];
}

export function InnDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [inn, setInn] = useState<Inn | null>(null);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInnDetail = async () => {
        setLoading(true);
        try {
            const data = await fetchWithAuth(`/api/inns/${id}`);
            setInn(data);
        } catch (error) {
            console.error(`宿(ID: ${id})の詳細取得に失敗しました:`, error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (id) {
            fetchInnDetail();
        }
    }, [id]);

    const handleSubmitReview = async (e: FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;
        setIsSubmitting(true);
        try {
            await fetchWithAuth(`/api/inns/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment }),
            });
            setComment('');
            setRating(5);
            // 投稿成功後、データを再取得してクチコミ一覧を更新
            fetchInnDetail(); 
        } catch (error) {
            alert('クチコミの投稿に失敗しました。');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>読み込み中...</div>;
    if (!inn) return <div>宿が見つかりませんでした。</div>;

    return (
        <div className="page-container">
            <h1 className="page-heading">{inn.name}</h1>
            <p className="inn-detail-area">エリア: {inn.area}</p>
            <p className="inn-detail-description">{inn.description}</p>
            
            <hr className="divider" />

            <div className="review-form-section">
                <h2 className="section-heading">クチコミを投稿する</h2>
                <form onSubmit={handleSubmitReview} className="review-form">
                    <div className="form-group">
                        <label htmlFor="rating">評価</label>
                        <select id="rating" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                            <option value={5}>★★★★★ (5)</option>
                            <option value={4}>★★★★☆ (4)</option>
                            <option value={3}>★★★☆☆ (3)</option>
                            <option value={2}>★★☆☆☆ (2)</option>
                            <option value={1}>★☆☆☆☆ (1)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">コメント</label>
                        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="宿の感想をお聞かせください" />
                    </div>
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? '投稿中...' : '投稿する'}
                    </button>
                </form>
            </div>

            <hr className="divider" />

            <div className="review-list-section">
                <h2 className="section-heading">クチコミ一覧 ({inn.reviews.length}件)</h2>
                <div className="review-list">
                    {inn.reviews.length > 0 ? (
                        inn.reviews.map(review => (
                            <div key={review.id} className="review-card">
                                <div className="review-header">
                                    <span className="review-username">{review.userName}</span>
                                    <span className="review-rating">{'★'.repeat(review.rating)}</span>
                                </div>
                                <p className="review-comment">{review.comment}</p>
                                <p className="review-date">{new Date(review.postedAt).toLocaleString('ja-JP')}</p>
                            </div>
                        ))
                    ) : (
                        <p>この宿にはまだクチコミがありません。</p>
                    )}
                </div>
            </div>

            <Link to="/" className="back-link">← 一覧に戻る</Link>
        </div>
    );
}