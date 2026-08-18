import React from "react";
import SEO from "../components/SEO.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import NoteCatalog from "../components/ui/NoteCatalog.jsx";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--accent)] selection:text-[var(--accent-on)]">
      <SEO
        title="Notes — Phaneendra Marri"
        description="Interactive notes, mental models, and deep dives into core engineering concepts."
      />
      <Navbar />
      <main className="flex-1">
        <NoteCatalog />
      </main>
      <Footer />
    </div>
  );
}
