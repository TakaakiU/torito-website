// src/utils/apiClient.ts
import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = 'http://localhost:8000'; // 本来は.envから取得

// 認証トークン付きでAPIを呼び出すfetch関数ラッパー
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // 現在のユーザーの認証セッションを取得
    const session = await fetchAuthSession();

    // デバッグ用
    console.log("Auth Session:", session);
    console.log("ID Token:", session.tokens?.idToken?.toString());
    console.log("Access Token:", session.tokens?.accessToken?.toString());

    const token = session.tokens?.idToken?.toString();

    if (!token) {
        throw new Error("No authentication token found.");
    }

    const headers = new Headers(options.headers || {});
    // 'Authorization'ヘッダーにJWTをセット
    headers.append('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    return response.json();
}