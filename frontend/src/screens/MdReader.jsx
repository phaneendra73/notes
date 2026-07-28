import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { getenv } from "../utils/getenv.js";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { FiAlertCircle } from "react-icons/fi";
import TrackHeader from "../components/reader/TrackHeader.jsx";
import TrackCanvas from "../components/reader/TrackCanvas.jsx";
import TrackBottomDock from "../components/reader/TrackBottomDock.jsx";
import SEO from "../components/SEO.jsx";
import { renderMarkdown } from "../utils/markdown.js";

const BATCH_SIZE = 5; // Load 5 slides at a time

export default function MdReader() {
  const location = useLocation();
  const blogId = useMemo(
    () => new URLSearchParams(location.search).get("id"),
    [location.search],
  );

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Progressive batch loading state
  const [loadedSlidesMap, setLoadedSlidesMap] = useState({});
  const [totalSlidesCount, setTotalSlidesCount] = useState(0);
  const [fetchingBatch, setFetchingBatch] = useState(false);

  // Slide navigation state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [visitedSlides, setVisitedSlides] = useState(new Set([0]));

// Helper: Pre-warm image cache for prefetched slide blocks
const prewarmImagesInSlides = (rawBatch = []) => {
  if (!Array.isArray(rawBatch)) return;
  rawBatch.forEach((slide) => {
    if (slide.blocks && Array.isArray(slide.blocks)) {
      slide.blocks.forEach((b) => {
        if (b.type === "image" && b.content) {
          const img = new Image();
          img.src = b.content;
        } else if (typeof b.content === "string") {
          const urls = b.content.match(
            /(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+|https?:\/\/\S+\.(?:png|jpg|jpeg|webp|gif|svg))/gi
          );
          if (urls) {
            urls.forEach((url) => {
              const img = new Image();
              img.src = url;
            });
          }
        }
      });
    }
  });
};

// Helper: Merge new batch of slides into loadedSlidesMap & prewarm images
const mergeSlidesBatch = useCallback((rawBatch = [], baseOffset = 0) => {
  setLoadedSlidesMap((prev) => {
    const nextMap = { ...prev };
    rawBatch.forEach((slide, idx) => {
      const targetIdx = baseOffset + idx;
      nextMap[targetIdx] = slide;
    });
    return nextMap;
  });
  prewarmImagesInSlides(rawBatch);
}, []);

// Helper: Fetch a specific 5-slide batch by offset with sessionStorage caching
const fetchSlideBatch = useCallback(
  async (offset, limit = BATCH_SIZE) => {
    if (!blogId) return;

    // Check sessionStorage cache first for instant response
    const cacheKey = `kadha_batch_${blogId}_${offset}_${limit}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        mergeSlidesBatch(parsed, offset);
        return;
      } catch {}
    }

    try {
      setFetchingBatch(true);
      const res = await axios.get(
        `${getenv("APIURL")}/lessons/get/${blogId}?offset=${offset}&limit=${limit}`
      );
      const fetchedSlides = res.data.slides || [];
      mergeSlidesBatch(fetchedSlides, offset);
      if (res.data.totalSlides || res.data.slidesCount) {
        setTotalSlidesCount(res.data.totalSlides || res.data.slidesCount);
      }
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(fetchedSlides));
      } catch {}
    } catch (err) {
      console.error(`Failed to fetch slide batch offset ${offset}:`, err);
    } finally {
      setFetchingBatch(false);
    }
  },
  [blogId, mergeSlidesBatch]
);

  // Initial fetch: Load lesson metadata & first batch (slides 1 to 5)
  useEffect(() => {
    if (!blogId) {
      setError("Invalid track ID.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLoadedSlidesMap({});

    axios
      .get(`${getenv("APIURL")}/lessons/get/${blogId}?offset=0&limit=${BATCH_SIZE}`)
      .then((res) => {
        setBlog(res.data);
        const initialBatch = res.data.slides || [];
        mergeSlidesBatch(initialBatch, 0);

        const total = res.data.totalSlides || res.data.slidesCount || initialBatch.length;
        setTotalSlidesCount(total);

        // Restore saved reading slide position
        const savedSlide = localStorage.getItem(`kadha_slide_${blogId}`);
        if (savedSlide) {
          const parsed = parseInt(savedSlide);
          if (!isNaN(parsed) && parsed >= 0 && parsed < total) {
            setCurrentSlideIndex(parsed);
          }
        }
      })
      .catch(() => setError("Unable to fetch note details."))
      .finally(() => setLoading(false));
  }, [blogId, mergeSlidesBatch]);

  // Progressive prefetching: Watch currentSlideIndex and load next batch of 5 before reaching end of current batch
  useEffect(() => {
    if (!blogId || totalSlidesCount === 0 || fetchingBatch) return;

    // Check if user is approaching un-fetched slides (within 2 slides of batch boundary)
    const nextTargetIdx = currentSlideIndex + 2;
    if (nextTargetIdx < totalSlidesCount && !loadedSlidesMap[nextTargetIdx]) {
      const batchOffset = Math.floor(nextTargetIdx / BATCH_SIZE) * BATCH_SIZE;
      fetchSlideBatch(batchOffset, BATCH_SIZE);
    }
  }, [currentSlideIndex, totalSlidesCount, loadedSlidesMap, fetchingBatch, blogId, fetchSlideBatch]);

  // Construct full Virtual Slides Array (combining loaded slides and lightweight placeholders)
  const slides = useMemo(() => {
    const count = totalSlidesCount || (blog?.slidesCount || 1);
    const result = [];
    for (let i = 0; i < count; i++) {
      if (loadedSlidesMap[i]) {
        result.push(loadedSlidesMap[i]);
      } else {
        result.push({
          step: i + 1,
          orderNumber: i + 1,
          title: `Slide ${i + 1}`,
          blocks: [],
          content: "Loading slide content...",
          isLoading: true,
        });
      }
    }
    return result;
  }, [totalSlidesCount, loadedSlidesMap, blog]);

  // Save position in localStorage
  useEffect(() => {
    if (!blogId || !slides.length) return;
    localStorage.setItem(`kadha_slide_${blogId}`, currentSlideIndex.toString());
    setVisitedSlides((prev) => new Set([...prev, currentSlideIndex]));
  }, [currentSlideIndex, blogId, slides.length]);

  // Handle jump to slide (fetches batch immediately if target slide is not yet loaded)
  const handleSelectSlide = useCallback(
    async (idx) => {
      setDirection(idx > currentSlideIndex ? 1 : -1);
      if (!loadedSlidesMap[idx]) {
        const batchOffset = Math.floor(idx / BATCH_SIZE) * BATCH_SIZE;
        await fetchSlideBatch(batchOffset, BATCH_SIZE);
      }
      setCurrentSlideIndex(idx);
    },
    [currentSlideIndex, loadedSlidesMap, fetchSlideBatch]
  );

  // Handlers
  const handleNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setDirection(1);
      if (!loadedSlidesMap[nextIdx]) {
        const batchOffset = Math.floor(nextIdx / BATCH_SIZE) * BATCH_SIZE;
        fetchSlideBatch(batchOffset, BATCH_SIZE);
      }
      setCurrentSlideIndex(nextIdx);
    }
  }, [currentSlideIndex, slides.length, loadedSlidesMap, fetchSlideBatch]);

  const handlePrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex((p) => p - 1);
    }
  }, [currentSlideIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;

      if (e.key === "ArrowRight" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        handleSelectSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        handleSelectSlide(slides.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, handleSelectSlide, slides.length]);

  // Auto-scroll to top on slide change
  useEffect(() => {
    if (!loading && blog) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentSlideIndex, loading, blog]);

  /**
   * PDF Export Handler: Fetches all remaining unloaded slides before printing
   */
  const handleDownloadPDF = useCallback(async () => {
    if (!blog || !slides.length) return;
    if (Object.keys(loadedSlidesMap).length < totalSlidesCount) {
      setFetchingBatch(true);
      try {
        const res = await axios.get(`${getenv("APIURL")}/lessons/get/${blogId}?offset=0&limit=0`);
        const allSlides = res.data.slides || [];
        mergeSlidesBatch(allSlides, 0);
      } catch (err) {
        console.error("PDF export slide fetch error:", err);
      } finally {
        setFetchingBatch(false);
      }
    }
    setTimeout(() => {
      window.print();
    }, 200);
  }, [blog, slides, loadedSlidesMap, totalSlidesCount, blogId, mergeSlidesBatch]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <>
      <SEO
        title={blog?.title || "Educational Track"}
        description={blog?.excerpt || "Read essay on Kadha 2.0."}
        image={blog?.imageUrl}
        article={true}
        publishedTime={blog?.createdAt}
        tags={blog?.tags || []}
        author={blog?.authorName || "Phaneendra"}
      />

      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #0f172a !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          .no-print, header, nav, footer, .no-print-area {
            display: none !important;
          }
          .print-area {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 1.5rem !important;
          }
          .print-slide-page {
            page-break-after: always;
            break-after: page;
            padding: 2.5rem;
            margin-bottom: 2rem;
            border: 1px solid #cbd5e1;
            border-radius: 16px;
            background: #ffffff !important;
            color: #0f172a !important;
            box-shadow: none !important;
          }
          .print-slide-page h1 {
            color: #0284c7 !important;
            font-size: 1.75rem !important;
            margin-bottom: 1rem !important;
          }
          .print-slide-page code, .print-slide-page pre {
            background: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
          }
        }
      `}</style>

      {/* ─── PRINT ONLY PDF LAYOUT CONTAINER ─── */}
      <div className="hidden print:block print-area">
        <div className="mb-8 pb-4 border-b border-slate-300">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{blog?.title}</h1>
          <p className="text-sm text-slate-600">
            Author: {blog?.authorName || "Phaneendra"} • Total Slides: {slides.length}
          </p>
        </div>

        {slides.map((s, idx) => (
          <div key={idx} className="print-slide-page">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-2">
              Slide {idx + 1} of {slides.length}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">{s.title}</h2>
            <div
              className="text-sm text-slate-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(s.content || "") }}
            />
          </div>
        ))}
      </div>

      {/* ─── SCREEN INTERACTIVE READER VIEW ─── */}
      <div className="min-h-screen flex flex-col bg-background text-foreground no-print-area">
        {/* Minimal Header */}
        <TrackHeader
          blog={blog}
          currentSlideIndex={currentSlideIndex}
          slidesCount={slides.length}
          slides={slides}
          onSelectSlide={handleSelectSlide}
          visitedSlides={visitedSlides}
          onDownload={handleDownloadPDF}
        />

        {/* Main Canvas - Centered Full Screen View */}
        <main className="min-h-screen flex-1 w-full max-w-5xl mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center">
          {loading && (
            <div className="w-full max-w-3xl flex flex-col gap-4">
              <Skeleton className="h-7 w-1/2 rounded-lg" />
              <Skeleton className="h-72 rounded-3xl" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-16 text-red-500 font-bold">
              <FiAlertCircle size={40} />
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && blog && (
            <div className="w-full flex items-center justify-center my-auto">
              <TrackCanvas
                currentSlide={currentSlide}
                currentSlideIndex={currentSlideIndex}
                direction={direction}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            </div>
          )}
        </main>

        {/* Bottom Navigation Dock */}
        {!loading && !error && blog && (
          <TrackBottomDock
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            slidesCount={slides.length}
            onPrev={handlePrev}
            onNext={handleNext}
            onSelectSlide={handleSelectSlide}
          />
        )}
      </div>
    </>
  );
}
