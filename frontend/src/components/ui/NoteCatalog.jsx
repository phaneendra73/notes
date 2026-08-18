import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useNotes from "../../hooks/useNotes.js";
import useTags from "../../hooks/useTags.js";
import NoteCard from "./NoteCard.jsx";
import { Pagination } from "./Pagination.jsx";
import { Skeleton } from "./Skeleton.jsx";
import NoteReaderModal from "./NoteReaderModal.jsx";
import HeroSection from "./HeroSection.jsx";
import {
  BookOpen,
  AlertCircle,
  X,
  ChevronDown,
  Check,
  Clock,
  Eye,
  Sparkles,
  Filter,
} from "lucide-react";

const SORT_OPTIONS = [
  { value: "recent", label: "Newest First", icon: Clock },
  { value: "views", label: "Most Viewed", icon: Eye },
  { value: "title", label: "Title (A–Z)", icon: Sparkles },
];

export default function NoteCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const catalogTopRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Parse URL search params
  const urlParams = new URLSearchParams(location.search);
  const tagParam = urlParams.get("tags") || urlParams.get("tag");
  const initialTagIds = tagParam
    ? tagParam
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x))
    : [];

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  // Multi-select tags state (array of numbers)
  const [selectedTagIds, setSelectedTagIds] = useState(initialTagIds);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Sync URL tag param changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const t = p.get("tags") || p.get("tag");
    if (t) {
      const ids = t
        .split(",")
        .map((x) => parseInt(x.trim(), 10))
        .filter((x) => !isNaN(x));
      setSelectedTagIds(ids);
    } else {
      setSelectedTagIds([]);
    }
    if (p.get("focus") === "search") {
      window.dispatchEvent(new CustomEvent("open-search-palette"));
    }
  }, [location.search]);

  const { tags: backendTags, loading: tagsLoading } = useTags();
  const backendSort = sortBy === "recent" ? "latest" : sortBy;
  const { notes, loading, isFetching, error, pagination, refetch } =
    useNotes(
      selectedTagIds.length > 0 ? selectedTagIds : null,
      "",
      currentPage,
      10,
      false,
      backendSort,
    );

  const isLoading = loading || isFetching;

  // Toggle a single tag in multi-select mode
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];
      return next;
    });
    setCurrentPage(1);
  };

  const selectAllTags = () => {
    setSelectedTagIds([]);
    setCurrentPage(1);
  };

  const handleCardClick = (note) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handleReadClick = (note, e) => {
    e.stopPropagation();
    navigate(`/read?id=${note.id}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNote(null);
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredNotes = notes;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    catalogTopRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const clearAllFilters = () => {
    setSelectedTagIds([]);
    setSortBy("recent");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedTagIds.length > 0;

  return (
    <>
      <div
        ref={catalogTopRef}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 font-sans"
      >
        {/* Centered Editorial Hero Section */}
        <HeroSection />

        {/* Controls Toolbar: Multi-Select Topic Filter Pills + Sort & View Modes */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-[var(--line)]">
          {/* Topic Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-0.5 no-scrollbar flex-1 min-w-0 relative z-10">
            {/* All Topics Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 450, damping: 25 }}
              onClick={selectAllTags}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                selectedTagIds.length === 0
                  ? "bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-[var(--shadow-sm)] ring-1 ring-[var(--accent)]/40"
                  : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
              }`}
            >
              {selectedTagIds.length === 0 && (
                <Check size={12} className="stroke-[3]" />
              )}
              <span>All</span>
            </motion.button>

            {/* Tags Loading Skeleton */}
            {tagsLoading ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-16 sm:w-20 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] animate-pulse shrink-0"
                  />
                ))}
              </div>
            ) : (
              backendTags.map((tag) => {
                const isActive = selectedTagIds.includes(tag.id);
                return (
                  <motion.button
                    key={tag.id}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-[var(--shadow-sm)] ring-1 ring-[var(--accent)]/40"
                        : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    {isActive && <Check size={12} className="stroke-[3]" />}
                    <span>{tag.name}</span>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Right Controls: Clear Filter + Sort + View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={clearAllFilters}
                className="text-xs text-[var(--accent)] hover:underline font-semibold flex items-center gap-1 mr-1 cursor-pointer bg-[var(--accent-soft)] px-2.5 py-1 rounded-[var(--radius-md)] border border-[var(--accent)]/30"
                title="Clear selected tag filters"
              >
                <X size={12} />
                <span>Clear ({selectedTagIds.length})</span>
              </motion.button>
            )}

            {/* Custom Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--ink)] cursor-pointer shadow-[var(--shadow-sm)] transition-all select-none"
                title="Sort Notes"
              >
                {(() => {
                  const currentOpt =
                    SORT_OPTIONS.find((opt) => opt.value === sortBy) ||
                    SORT_OPTIONS[0];
                  const IconComp = currentOpt.icon;
                  return (
                    <>
                      <IconComp size={13} className="text-[var(--accent)]" />
                      <span>{currentOpt.label}</span>
                    </>
                  );
                })()}
                <ChevronDown
                  size={13}
                  className={`text-[var(--muted)] transition-transform duration-200 ${
                    sortDropdownOpen ? "rotate-180 text-[var(--accent)]" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] py-1 z-30 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      const IconComp = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setCurrentPage(1);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                              : "text-[var(--ink)] hover:bg-[var(--surface-2)]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComp
                              size={14}
                              className={
                                isSelected
                                  ? "text-[var(--accent)]"
                                  : "text-[var(--muted)]"
                              }
                            />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-[var(--accent)]" />
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-[var(--radius-md)] border border-[var(--err-line)] bg-[var(--err-soft)] text-[var(--err)] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={refetch}
              className="font-bold underline hover:no-underline flex items-center gap-1 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4 w-full min-w-0">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="p-4 sm:p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5"
              >
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--radius-sm)] shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="w-16 h-4 rounded" />
                    <Skeleton className="w-3/4 h-5 rounded" />
                    <Skeleton className="w-full h-4 rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--line)]">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-16 h-7 rounded-[var(--radius-sm)]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotes.length > 0 ? (
          /* Notes List */
          <div className="space-y-3 sm:space-y-4 w-full min-w-0">
            {filteredNotes.map((note, idx) => (
              <NoteCard
                key={note.id}
                note={note}
                index={idx}
                onCardClick={handleCardClick}
                onReadClick={handleReadClick}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12 sm:py-16 space-y-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] px-4">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--muted)]">
              <BookOpen size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-[var(--ink)]">
                No notes found
              </h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No notes matched your selected tags. Try selecting different topics or clearing the filter."
                  : "No published study notes are available yet."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="pt-4 sm:pt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Modal Quick Reader */}
      <NoteReaderModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        note={selectedNote}
      />
    </>
  );
}
