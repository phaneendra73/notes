import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Home, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-5 rounded-[var(--radius-lg)]
            border border-[var(--line)] bg-[var(--surface)] p-10 md:p-14
            shadow-[var(--shadow-md)] max-w-sm w-full"
        >
          <span className="font-serif font-bold text-8xl md:text-9xl text-[var(--line-strong)] leading-none select-none">
            404
          </span>
          <div>
            <h1 className="font-serif font-bold text-2xl text-[var(--ink)] mb-1">
              Page Not Found
            </h1>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              The note or page you are looking for does not exist.
            </p>
          </div>
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]
                border border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-on)]
                text-xs font-bold hover:bg-[var(--accent-strong)] transition-colors cursor-pointer
                shadow-[var(--shadow-sm)]"
            >
              <Home size={14} /> Go Home
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)]
                border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]
                text-xs font-semibold hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]
                transition-colors cursor-pointer shadow-[var(--shadow-sm)]"
            >
              <BookOpen size={14} className="text-[var(--accent)]" /> Browse Notes
            </button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
