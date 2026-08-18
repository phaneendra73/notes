import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast.jsx';
import HomePage from './pages/HomePage.jsx';
import NoteReaderPage from './pages/NoteReaderPage.jsx';
import SigninPage from './pages/SigninPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Lazy-load author studio pages
const NoteEditorPage = lazy(() => import('./pages/NoteEditorPage.jsx'));
const StudioPage = lazy(() => import('./pages/StudioPage.jsx'));
const TagManagerPage = lazy(() => import('./pages/TagManagerPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] font-sans">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
        <span className="text-xs font-semibold text-[var(--muted)]">Loading Notes…</span>
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
          <Route path="/read" element={<NoteReaderPage />} />
          <Route path="/signin" element={<SigninPage />} />

          {/* Lazy-loaded protected author studio routes */}
          <Route path="/editor" element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} />
          <Route path="/studio" element={<ProtectedRoute><StudioPage /></ProtectedRoute>} />
          <Route path="/studio/notes/new" element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} />
          <Route path="/studio/notes/:id" element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} />
          <Route path="/tags" element={<ProtectedRoute><TagManagerPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* 404 Not Found & Catch-all route */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  );
}
