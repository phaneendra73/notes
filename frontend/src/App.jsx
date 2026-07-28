import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './screens/LandingPage.jsx';
import MdReader from './screens/MdReader.jsx';
import Signin from './screens/Signin.jsx';
import NotFound from './screens/NotFound.jsx';

// Lazy-load author/admin screens to reduce initial bundle size
const MdEditor = lazy(() => import('./screens/MdEditor.jsx'));
const AdminPage = lazy(() => import('./screens/AdminPage.jsx'));
const TagManager = lazy(() => import('./screens/TagManager.jsx'));
const ProfilePage = lazy(() => import('./screens/ProfilePage.jsx'));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span className="text-sm font-medium text-muted-foreground">Loading studio...</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Core public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/blog" element={<Navigate to="/" replace />} />
        <Route path="/read" element={<MdReader />} />
        <Route path="/signin" element={<Signin />} />

        {/* Lazy-loaded author studio routes */}
        <Route path="/editor/:id?" element={<MdEditor />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/tags" element={<TagManager />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Legacy PascalCase route redirects for backward compatibility */}
        <Route path="/BlogPosts" element={<Navigate to="/blog" replace />} />
        <Route path="/Read" element={<Navigate to="/read" replace />} />
        <Route path="/Editor/*" element={<Navigate to="/editor" replace />} />
        <Route path="/Admin" element={<Navigate to="/admin" replace />} />
        <Route path="/Tag" element={<Navigate to="/tags" replace />} />
        <Route path="/Profile" element={<Navigate to="/profile" replace />} />
        <Route path="/Signin" element={<Navigate to="/signin" replace />} />

        {/* Error routes */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}
