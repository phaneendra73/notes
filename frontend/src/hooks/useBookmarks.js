import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kadha_bookmarks';

// Global memory state shared across all hook callers in the application
let globalBookmarks = [];

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !isNaN(n)) : [];
  } catch {
    return [];
  }
}

globalBookmarks = loadFromStorage();

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener(globalBookmarks));
}

// Sync across browser tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      globalBookmarks = loadFromStorage();
      notifyListeners();
    }
  });
}

export function getBookmarks() {
  return globalBookmarks;
}

export function toggleBookmarkGlobal(id) {
  const numId = Number(id);
  if (isNaN(numId)) return;

  if (globalBookmarks.includes(numId)) {
    globalBookmarks = globalBookmarks.filter((b) => b !== numId);
  } else {
    globalBookmarks = [...globalBookmarks, numId];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(globalBookmarks));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }

  notifyListeners();
}

export function isBookmarkedGlobal(id) {
  return globalBookmarks.includes(Number(id));
}

/**
 * Global reactive hook for managing bookmarked note IDs.
 * Guarantees 100% instant UI synchronization across all components and pages.
 */
export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(globalBookmarks);

  useEffect(() => {
    const handleChange = (newBookmarks) => {
      setBookmarks([...newBookmarks]);
    };
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const toggleBookmark = useCallback((id) => {
    toggleBookmarkGlobal(id);
  }, []);

  const isBookmarked = useCallback(
    (id) => bookmarks.includes(Number(id)),
    [bookmarks]
  );

  const clearBookmarks = useCallback(() => {
    globalBookmarks = [];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    } catch (e) {}
    notifyListeners();
  }, []);

  return { bookmarks, toggleBookmark, isBookmarked, clearBookmarks };
}
