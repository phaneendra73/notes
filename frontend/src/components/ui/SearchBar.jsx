import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./Input.jsx";
import { Badge } from "./Badge.jsx";
import useSearch from "../../hooks/useSearch.js";
import { FiSearch, FiArrowRight, FiLoader, FiX, FiZap } from "react-icons/fi";

const PLACEHOLDERS = [
  "Search C# Task.WhenAll & Async/Await...",
  "Search Binary Trees, AVL & Graph BFS...",
  "Search Cache-Aside & System Design...",
  "Search B-Tree Indexing & SQL Queries...",
];

const POPULAR_TAGS = [
  { label: "⚡ C# & .NET", query: "C#" },
  { label: "🌳 DSA", query: "DSA" },
  { label: "📐 System Design", query: "System Design" },
  { label: "🛢️ SQL", query: "SQL" },
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const { results, loading } = useSearch(query);
  const navigate = useNavigate();

  // Cycle placeholder texts
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Listen for Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setQuery("");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleChipClick = (chipQuery) => {
    setQuery(chipQuery);
    const el = document.getElementById("notes-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto mb-12 px-4 z-40">
      {/* Search Input Box Container */}
      <div className="relative flex flex-col gap-3">
        <div className="relative flex items-center group">
          <FiSearch
            size={18}
            className="absolute left-4 text-primary pointer-events-none group-focus-within:scale-110 transition-transform"
          />
          <Input
            type="text"
            placeholder={PLACEHOLDERS[placeholderIndex]}
            className="pl-12 pr-20 h-14 rounded-2xl bg-card/95 border-border/80 text-foreground placeholder:text-muted-foreground/60 shadow-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:shadow-[0_0_25px_var(--neon-glow)] transition-all text-sm md:text-base font-semibold"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="absolute right-3 flex items-center gap-2 pointer-events-none">
            {!query && (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2.5 py-1 rounded-xl border border-border/80 bg-muted/60 text-[10px] font-mono font-bold text-muted-foreground shadow-xs">
                Esc
              </kbd>
            )}
            {loading ? (
              <FiLoader size={18} className="text-primary animate-spin" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="pointer-events-auto text-muted-foreground hover:text-foreground p-1.5 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                title="Clear search"
              >
                <FiX size={15} />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Dynamic Search Results Dropdown */}
      <AnimatePresence>
        {query.trim().length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+8px)] left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] max-h-96 overflow-y-auto p-2 flex flex-col gap-1 z-50"
          >
            {results.length === 0 && !loading ? (
              <div className="py-10 text-center text-xs md:text-sm text-muted-foreground font-semibold">
                No matching tech notes found for "
                <strong className="text-foreground">{query}</strong>".
              </div>
            ) : (
              results.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => {
                    navigate(`/read?id=${blog.id}`);
                    setQuery("");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all text-left group cursor-pointer"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-3">
                    <p className="font-extrabold text-xs md:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {blog.title}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {blog.tags?.slice(0, 3).map((t) => (
                        <Badge key={t} className="text-[10px] py-0 font-bold">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FiArrowRight
                    size={16}
                    className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                  />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
