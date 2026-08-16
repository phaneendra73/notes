import React from "react";
import SEO from "../components/SEO.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import LessonCatalog from "../components/ui/LessonCatalog.jsx";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--accent)] selection:text-[var(--accent-on)]">
      <SEO
        title="Notes — Visual Engineering Study Decks"
        description="Interactive visual study notes for software engineers covering C#, .NET Core 8, Data Structures, SQL Indexing, and System Design."
      />
      <Navbar />
      <main className="flex-1">
        <LessonCatalog />
      </main>
      <Footer />
    </div>
  );
}

