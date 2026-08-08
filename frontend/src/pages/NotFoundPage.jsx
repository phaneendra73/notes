import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FiHome, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-80 w-80 rounded-full blur-3xl opacity-20 bg-primary/10" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex flex-col items-center gap-4 rounded-[28px] border border-border bg-card/80 p-8 md:p-12 shadow-xl backdrop-blur-md"
        >
          <span className="text-8xl md:text-9xl font-black gradient-text">
            404
          </span>
          <h2 className="text-2xl font-extrabold text-foreground">
            Page Not Found
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            The note or page you are looking for does not exist on Notes.
          </p>
          <div className="flex gap-3 mt-2">
            <Button variant="neon" onClick={() => navigate('/')} className="gap-2">
              <FiHome size={15} />
              Go Home
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
              <FiBookOpen size={15} />
              Explore Lessons
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
