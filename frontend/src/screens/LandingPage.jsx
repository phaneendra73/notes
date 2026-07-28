import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Appbar, Hero, SearchBar, HomeBlogs, Footer } from '../components/ui/index.js';
import SEO from '../components/SEO.jsx';

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#notes-section') {
      setTimeout(() => {
        const el = document.getElementById('notes-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-[rgb(var(--background))]">
      <SEO
        title="Kadha 2.0 — Edge-Powered Publishing Platform"
        description="Kadha 2.0 brings lightning-fast edge database execution, interactive reader claps, markdown split authoring, and glassmorphic aesthetics."
      />
      <Appbar />
      <main className="flex-grow">
        <Hero />
        <SearchBar />
        <HomeBlogs />
      </main>
      <Footer />
    </div>
  );
}
