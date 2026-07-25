import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Appbar, Footer, Button } from '../components/ui/index.js';
import { FiHome, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <Appbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        {/* Ambient blur */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-80 w-80 rounded-full blur-3xl opacity-10"
               style={{ background: 'var(--neon-dim)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex flex-col items-center gap-4 rounded-[28px] border border-border bg-white/70 px-8 py-10 shadow-[0_20px_60px_rgba(2,6,23,0.06)] backdrop-blur-md"
        >
          <span
            className="text-8xl md:text-9xl font-black gradient-text"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            404
          </span>
          <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]"
              style={{ fontFamily: 'Outfit, sans-serif' }}>
            Page Not Found
          </h2>
          <p className="text-sm text-[rgb(var(--muted-foreground))] max-w-sm leading-relaxed">
            The page or story you&rsquo;re looking for doesn&rsquo;t exist on Kadha 2.0.
          </p>
          <div className="flex gap-3 mt-2">
            <Button onClick={() => navigate('/')}>
              <FiHome className="w-4 h-4" />
              Go Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/BlogPosts')}>
              <FiBookOpen className="w-4 h-4" />
              Browse Stories
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
