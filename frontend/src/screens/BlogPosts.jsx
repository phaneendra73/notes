import React, { useState } from 'react';
import useBlogs from '../hooks/useBlogs.js';
import useTags from '../hooks/useTags.js';
import SEO from '../components/SEO.jsx';
import { Appbar, Footer } from '../components/ui/index.js';
import BlogCard from '../components/ui/BlogCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { FiSearch, FiBookOpen } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function BlogPosts() {
  const [selectedTag, setSelectedTag] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const { tags } = useTags();
  const { blogs, pagination, loading, error } = useBlogs(page, selectedTag ? [selectedTag] : [], searchQuery, sortOption);

  const categories = ['All', 'C# & .NET', 'DSA', 'SQL', 'System Design'];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Explore Tech Notes — C#, .NET, DSA & SQL"
        description="Browse, filter, and search study notes on C#, .NET Core, Data Structures & Algorithms, and SQL."
      />
      <Appbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Controls Bar (Matching Screenshot 1 Header Layout) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          {/* Left Side: Topic Category Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/80 flex-wrap">
            {categories.map((cat) => {
              const isActive = (cat === 'All' && !selectedTag) || selectedTag === cat;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedTag(cat === 'All' ? '' : cat);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm border border-border/80'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Right Side: Search & Sort Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative w-48 md:w-56">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
              />
            </div>

            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 text-xs font-bold rounded-xl bg-card border border-border text-foreground cursor-pointer outline-none focus:border-primary"
            >
              <option value="latest">Sort by: Latest</option>
              <option value="views">Sort by: Most Viewed</option>
              <option value="oldest">Sort by: Oldest</option>
            </select>
          </div>
        </motion.div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-[22px] border border-border bg-card flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm text-center">
            Failed to load notes. Please check connection and try again.
          </div>
        )}

        {/* Course Cards List Stack (Direct click opens note slide reader) */}
        {!loading && !error && (
          <div className="flex flex-col gap-3.5">
            {blogs.length === 0 ? (
              <div className="p-12 text-center rounded-[24px] border border-border bg-card flex flex-col items-center gap-3">
                <FiBookOpen size={36} className="text-muted-foreground" />
                <h3 className="font-heading font-extrabold text-lg text-foreground">No notes found</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Try adjusting your search query or topic filter.
                </p>
              </div>
            ) : (
              blogs.map((blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl font-extrabold text-xs"
            >
              Previous
            </Button>
            <span className="text-xs font-bold text-muted-foreground px-2">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl font-extrabold text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
