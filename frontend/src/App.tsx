import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { InnListPage } from './components/InnListPage';
import { InnDetailPage } from './components/InnDetailPage';

// ログイン後に表示されるアプリ本体の部分
function AppContent() {
    return (
        <BrowserRouter>
            <header className="app-header">
                <RouterLink to="/" className="header-logo">Torito</RouterLink>
                {/* ここにナビゲーションメニューを追加予定 */}
            </header>
            <main className="app-main">
                <Routes>
                    {/* URLが '/' の場合は InnListPage を表示 */}
                    <Route path="/" element={<InnListPage />} />
                    {/* URLが '/inns/:id' の場合は InnDetailPage を表示 */}
                    <Route path="/inns/:id" element={<InnDetailPage />} />
                    {/* 他のページを以降に追加予定 */}
                </Routes>
            </main>
        </BrowserRouter>
    );
}

function App() {
  return (
    <Authenticator>
      {/* ログインが成功すると AppContent が表示 */}
      <AppContent />
    </Authenticator>
  );
}

export default App;