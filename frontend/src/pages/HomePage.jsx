import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SEO from "../components/SEO.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import Hero from "../components/ui/Hero.jsx";
import HeroFeatures from "../components/ui/HeroFeatures.jsx";
import LessonCatalog from "../components/ui/LessonCatalog.jsx";

export default function HomePage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#notes-section") {
      setTimeout(() => {
        document
          .getElementById("notes-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary selection:text-black">
      <SEO
        title="Notes — Visual Engineering Study Decks | notes.phaneendramarri.com"
        description="Interactive visual study notes for software engineers covering C#, .NET Core 8, Data Structures, SQL Indexing, and System Design."
      />
      <Navbar />
      <main className="flex-grow space-y-8">
        <Hero />
        <HeroFeatures />
        <section
          id="notes-section"
          className="max-w-7xl mx-auto px-4 md:px-6 pb-24"
        >
          <LessonCatalog />
        </section>
      </main>
      <Footer />
    </div>
  );
}
