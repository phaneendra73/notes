import React, { useState } from 'react';
import useLessons from '../../hooks/useLessons.js';
import useTags from '../../hooks/useTags.js';
import LessonCard from './LessonCard.jsx';
import { Pagination } from './Pagination.jsx';
import { Skeleton } from './Skeleton.jsx';
import { Badge } from './Badge.jsx';
import { FiBookOpen, FiTag, FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function LessonCatalog({ searchQuery = '', isBookmarkedOnly = false, bookmarkedIds = [] }) {
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { tags, loading: tagsLoading } = useTags();
  const { lessons, loading, error, pagination, refetch } = useLessons(selectedTagId, searchQuery, currentPage, 9);

  let filteredLessons = lessons;
  if (isBookmarkedOnly) {
    filteredLessons = lessons.filter((l) => bookmarkedIds.includes(l.id));
  }

  const handleTagClick = (tagId) => {
    setSelectedTagId(selectedTagId === tagId ? null : tagId);
    setCurrentPage(1);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Tags Filter Header Bar */}
      <div className="flex flex-col gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <FiTag size={13} className="text-primary" /> Filter by Subject Tag:
          </span>
          {selectedTagId && (
            <button
              onClick={() => setSelectedTagId(null)}
              className="text-xs text-primary hover:underline font-bold cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedTagId === null ? 'default' : 'outline'}
            onClick={() => handleTagClick(null)}
            className="cursor-pointer text-xs px-3 py-1 font-bold rounded-xl transition-all"
          >
            All Tracks
          </Badge>

          {tagsLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-7 w-20 rounded-xl" />
              ))
            : tags.map((t) => (
                <Badge
                  key={t.id}
                  variant={selectedTagId === t.id ? 'default' : 'outline'}
                  onClick={() => handleTagClick(t.id)}
                  className="cursor-pointer text-xs px-3 py-1 font-bold rounded-xl transition-all hover:border-primary/50"
                >
                  {t.name}
                </Badge>
              ))}
        </div>
      </div>

      {/* Main Grid or Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 mt-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center flex flex-col items-center gap-3">
          <FiAlertCircle size={32} className="text-rose-400" />
          <h3 className="font-heading font-extrabold text-lg text-rose-300">Failed to Load Lessons</h3>
          <p className="text-xs text-rose-300/80">{error}</p>
          <button
            onClick={() => refetch(currentPage)}
            className="mt-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-600 transition-colors cursor-pointer"
          >
            <FiRefreshCw size={13} /> Retry Loading
          </button>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border/80 bg-card text-center flex flex-col items-center gap-3 my-4">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            {searchQuery ? <FiSearch size={24} /> : <FiBookOpen size={24} />}
          </div>
          <h3 className="font-heading font-extrabold text-lg text-foreground">No Lessons Found</h3>
          <p className="text-xs text-muted-foreground max-w-md">
            {searchQuery
              ? `No tracks matched "${searchQuery}". Try searching for another topic or clear tag filters.`
              : isBookmarkedOnly
              ? 'You have not saved any bookmarked lessons yet.'
              : 'No lessons are published currently.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((l) => (
              <LessonCard key={l.id} lesson={l} />
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={pagination.page || pagination.currentPage || 1}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
