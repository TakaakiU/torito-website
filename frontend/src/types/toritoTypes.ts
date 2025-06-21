// frontend/src/types/toritoTypes.ts

// クチコミのデータ構造
export interface Review {
  id: number;
  innId: number;
  userName: string;
  rating: number;
  comment: string;
  postedAt: string; // 日付は文字列として受け取ることが多い
}

// 宿詳細データの完全な構造 (APIの応答)
export interface InnDetail {
  id: number;
  name: string;
  area: string;
  description: string;
  photoUrls: string[];
  reviews: Review[]; // クチコミの配列
}