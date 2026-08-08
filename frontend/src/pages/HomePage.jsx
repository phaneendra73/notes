import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import Hero from '../components/ui/Hero.jsx';
import SearchBar from '../components/ui/SearchBar.jsx';
import LessonCatalog from '../components/ui/LessonCatalog.jsx';

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#notes-section') {
      setTimeout(() => {
        document.getElementById('notes-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Kadha — Interactive Technical Notes"
        description="Master C#, .NET, DSA & SQL with interactive slide-based study notes."
      />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <SearchBar />
        <section id="notes-section" className="max-w-6xl mx-auto px-4 md:px-6 pb-16">
          <LessonCatalog />
        </section>
      </main>
      <Footer />
    </div>
  );
}
