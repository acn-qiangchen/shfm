import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/auth/AuthProvider';
import { LoginPage } from './components/auth/LoginPage';
import { useAuth } from './components/auth/AuthProvider';
import { TagsPage } from './pages/TagsPage';
import './config/amplify';

const queryClient = new QueryClient();

function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900">家計簿アプリ</h1>
            <nav className="flex space-x-4">
              <Link
                to="/"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                ホーム
              </Link>
              <Link
                to="/tags"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                タグ管理
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 mr-4">{user?.email}</span>
            <button
              onClick={() => signOut()}
              className="bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function MainContent() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-100">
      <Routes>
        <Route
          path="/"
          element={
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                  {/* TODO: ここにダッシュボードの内容を実装 */}
                  <p className="text-gray-500">ダッシュボードの実装準備中...</p>
                </div>
              </div>
            </div>
          }
        />
        <Route path="/tags" element={<TagsPage />} />
      </Routes>
    </main>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <MainContent />
    </div>
  );
}

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App; 