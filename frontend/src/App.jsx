import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import LessonReaderPage from './pages/LessonReaderPage.jsx';
import SigninPage from './pages/SigninPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Lazy-load author studio pages
const LessonEditorPage = lazy(() => import('./pages/LessonEditorPage.jsx'));
const StudioPage = lazy(() => import('./pages/StudioPage.jsx'));
const TagManagerPage = lazy(() => import('./pages/TagManagerPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-semibold text-muted-foreground">Loading Notes…</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Core public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/read" element={<LessonReaderPage />} />
          <Route path="/signin" element={<SigninPage />} />

          {/* Lazy-loaded protected author studio routes */}
          <Route path="/editor" element={<ProtectedRoute><LessonEditorPage /></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
          <Route path="/tags" element={<ProtectedRoute><TagManagerPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* Legacy route redirects */}
          <Route path="/admin" element={<Navigate to="/studio" replace />} />
          <Route path="/blog" element={<Navigate to="/" replace />} />
          <Route path="/BlogPosts" element={<Navigate to="/" replace />} />
          <Route path="/Read" element={<Navigate to="/read" replace />} />
          <Route path="/Editor/*" element={<Navigate to="/editor" replace />} />
          <Route path="/Admin" element={<Navigate to="/studio" replace />} />
          <Route path="/Tag" element={<Navigate to="/tags" replace />} />
          <Route path="/Profile" element={<Navigate to="/profile" replace />} />
          <Route path="/Signin" element={<Navigate to="/signin" replace />} />

          {/* Error routes */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
