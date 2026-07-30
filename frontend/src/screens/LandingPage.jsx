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
        title="Kadha Notes — Note & Concept Sharing Platform"
        description="Kadha Notes is an interactive note sharing platform for exploring engineering concepts, technical articles, and study notes."
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
