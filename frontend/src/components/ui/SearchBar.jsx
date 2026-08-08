import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./Input.jsx";
import { Badge } from "./Badge.jsx";
import useSearch from "../../hooks/useSearch.js";
import {
  FiSearch, FiArrowRight, FiLoader, FiX, FiZap,
  FiCode, FiCpu, FiLayers, FiDatabase
} from "react-icons/fi";

const PLACEHOLDERS = [
  "Search C# Task.WhenAll & Async/Await…",
  "Search Binary Trees, Graph BFS & Algorithms…",
  "Search Cache-Aside & System Design…",
  "Search B-Tree Indexing & SQL Queries…",
];

const QUICK_TRACKS = [
  { label: "C# & .NET", icon: FiCode, tag: "C#" },
  { label: "DSA", icon: FiCpu, tag: "DSA" },
  { label: "System Design", icon: FiLayers, tag: "System Design" },
  { label: "SQL", icon: FiDatabase, tag: "SQL" },
];

export default function SearchBar({ onSelectQuery }) {
  const [query, setQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const { results, loading } = useSearch(query);
  const navigate = useNavigate();

  // Cycle placeholder texts
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3800);
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

  const handleQuickChip = (tag) => {
    if (onSelectQuery) {
      onSelectQuery(tag);
    } else {
      setQuery(tag);
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto mb-10 px-4 z-30">
      {/* ── Glassmorphic Command Search Card ── */}
      <motion.div
        animate={{
          borderColor: focused ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
          boxShadow: focused ? '0 0 35px var(--neon-glow)' : '0 12px 35px rgba(0,0,0,0.25)',
        }}
        transition={{ duration: 0.25 }}
        className="relative p-2 sm:p-3 rounded-3xl bg-card/90 backdrop-blur-2xl border transition-all flex flex-col gap-3"
      >
        {/* Main Search Input Row */}
        <div className="relative flex items-center">
          <div className="absolute left-4 text-primary pointer-events-none flex items-center justify-center">
            <FiSearch size={20} />
          </div>

          <input
            type="text"
            placeholder={PLACEHOLDERS[placeholderIndex]}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-12 pr-20 h-13 sm:h-14 rounded-2xl bg-muted/30 border border-transparent text-foreground placeholder:text-muted-foreground/60 text-sm md:text-base font-bold focus:outline-none focus:bg-background/80 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="absolute right-3 flex items-center gap-2">
            {!query && (
              <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border/80 bg-muted/80 text-[10px] font-mono font-extrabold text-muted-foreground shadow-xs">
                Esc
              </kbd>
            )}
            {loading ? (
              <FiLoader size={18} className="text-primary animate-spin" />
            ) : query ? (
              <button
                onClick={() => setQuery("")}
                className="pointer-events-auto text-muted-foreground hover:text-foreground p-1.5 rounded-xl bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
                title="Clear search"
              >
                <FiX size={15} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Quick Topic Chips */}
        <div className="flex items-center gap-2 overflow-x-auto px-1 pb-1 pt-0.5 no-scrollbar">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground shrink-0 flex items-center gap-1">
            <FiZap size={11} className="text-primary" /> Quick Topic:
          </span>
          {QUICK_TRACKS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.tag}
                onClick={() => handleQuickChip(t.tag)}
                className="px-3 py-1 rounded-full border border-border/70 bg-card hover:border-primary/50 hover:bg-primary/10 hover:text-primary text-xs font-bold text-muted-foreground transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <Icon size={12} className="text-primary" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Dynamic Floating Search Results Dropdown */}
      <AnimatePresence>
        {query.trim().length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+10px)] left-4 right-4 bg-card/95 backdrop-blur-2xl border border-border/90 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.5)] max-h-96 overflow-y-auto p-2.5 flex flex-col gap-1.5 z-50"
          >
            {results.length === 0 && !loading ? (
              <div className="py-8 text-center text-xs md:text-sm text-muted-foreground font-bold">
                No notes found matching "
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
                  className="w-full flex items-center justify-between p-3 sm:p-4 rounded-2xl hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all text-left group cursor-pointer"
                >
                  <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-3">
                    <p className="font-extrabold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {blog.title}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {blog.tags?.slice(0, 3).map((t) => (
                        <Badge key={t} className="text-[10px] py-0 font-bold bg-primary/10 text-primary border-primary/20">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted/60 group-hover:bg-primary group-hover:text-black transition-colors flex items-center justify-center shrink-0">
                    <FiArrowRight
                      size={15}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
