import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "./Button.jsx";
import {
  Code2,
  Zap,
  Database,
  Cpu,
  Layers,
  Check,
  Terminal,
  Play,
  BookOpen,
  ArrowRight,
  Sparkles,
  Copy,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

const HERO_TRACKS = [
  {
    id: "csharp",
    title: "C# Async & State Machine",
    icon: Code2,
    tag: ".NET Core 8",
    snippet: `// Task-based Async Pattern (TAP)
public async Task<UserData> FetchAsync(int id)
{
    // Yield execution back to ThreadPool
    var json = await _http.GetStringAsync($"/users/{id}");
    return JsonSerializer.Deserialize<UserData>(json);
}`,
    diagram: "Thread [T1] --> Await Yields --> ThreadPool [T2]",
    quizQuestion: "What happens during 'await' in C# async methods?",
    quizOptions: ["Thread blocks continuously", "Thread yields to ThreadPool", "Exception thrown"],
    correctIdx: 1,
  },
  {
    id: "dsa",
    title: "Tree Traversals & DP",
    icon: Cpu,
    tag: "Data Structures",
    snippet: `// BFS Level-Order Traversal
public IList<IList<int>> LevelOrder(TreeNode root)
{
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);
    // Process nodes level by level O(N)
}`,
    diagram: "Root [Node A] --> Left [Node B] + Right [Node C]",
    quizQuestion: "Which queue property enforces BFS ordering?",
    quizOptions: ["LIFO Stack", "FIFO Queue", "Priority Heap"],
    correctIdx: 1,
  },
  {
    id: "system-design",
    title: "System Design & Cache",
    icon: Layers,
    tag: "Architecture",
    snippet: `// Cache-Aside Pattern with Redis
public async Task<User> GetUser(string key)
{
    var cached = await _redis.GetAsync<User>(key);
    if (cached != null) return cached;
    var dbUser = await _db.QueryAsync(key);
    await _redis.SetAsync(key, dbUser, TimeSpan.FromMinutes(30));
    return dbUser;
}`,
    diagram: "Client --> Cache Hit (Redis) | Cache Miss --> DB Load",
    quizQuestion: "Where does Cache-Aside check for data first?",
    quizOptions: ["Primary Database", "Redis In-Memory Cache", "Disk Storage"],
    correctIdx: 1,
  },
  {
    id: "sql",
    title: "SQL B-Tree Indexing",
    icon: Database,
    tag: "Databases",
    snippet: `-- B-Tree Compound Index Optimization
CREATE INDEX idx_users_status_created 
ON users(status, created_at DESC);

EXPLAIN QUERY PLAN 
SELECT id, email FROM users 
WHERE status = 'active' ORDER BY created_at DESC;`,
    diagram: "Root Node --> Internal Index Page --> Leaf Data Page",
    quizQuestion: "Why place high-cardinality columns first in B-Tree index?",
    quizOptions: ["Reduces search space faster", "Ignores WHERE clause", "Disables index scans"],
    correctIdx: 0,
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const [activeTrackIdx, setActiveTrackIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [selectedQuizIdx, setSelectedQuizIdx] = useState(null);
  const [typedText, setTypedText] = useState("");
  const showcaseRef = useRef(null);
  const isInView = useInView(showcaseRef, { once: false, margin: "-50px" });

  const activeTrack = HERO_TRACKS[activeTrackIdx] || HERO_TRACKS[0];

  // Auto-rotate track every 8 seconds unless user is interacting
  useEffect(() => {
    const autoRotate = setInterval(() => {
      setActiveTrackIdx((prev) => (prev + 1) % HERO_TRACKS.length);
    }, 8000);
    return () => clearInterval(autoRotate);
  }, []);

  // Typewriter effect triggered whenever track changes or showcase enters view
  useEffect(() => {
    setTypedText("");
    setSelectedQuizIdx(null);
    let i = 0;
    const code = activeTrack.snippet;
    const timer = setInterval(() => {
      if (i < code.length) {
        setTypedText((prev) => prev + code.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 12);
    return () => clearInterval(timer);
  }, [activeTrackIdx, isInView]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeTrack.snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExploreClick = () => {
    const el = document.getElementById("notes-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/#notes-section");
  };

  return (
    <section className="relative py-10 md:py-14 px-4 sm:px-6 bg-[var(--bg)] border-b border-[var(--line)] font-sans">
      <div className="max-w-[var(--maxw)] mx-auto flex flex-col items-center text-center">
        {/* Visual Engineering Notes Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold uppercase tracking-widest">
            <Zap size={14} className="text-[var(--accent)]" />
            <span>Visual Engineering Notes for Software Engineers</span>
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          </span>
        </motion.div>

        {/* Master Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-[var(--ink)] max-w-4xl mb-4"
        >
          Master C#, .NET, DSA & SQL with Interactive Notes.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="font-sans text-sm sm:text-base text-[var(--ink-2)] max-w-2xl leading-relaxed mb-6 font-normal"
        >
          A personal study hub with slide-by-slide interactive notes covering C#, .NET Core 8, Data Structures & Algorithms, SQL Indexing, and Distributed System Architecture.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-8"
        >
          <Button
            size="lg"
            className="rounded-[var(--radius-md)] font-semibold gap-2 px-6 py-2.5 text-sm cursor-pointer bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] transition-colors shadow-[var(--shadow-sm)]"
            onClick={handleExploreClick}
          >
            <BookOpen size={16} />
            Explore Notes Library
            <ArrowRight size={16} />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="rounded-[var(--radius-md)] font-semibold gap-2 px-5 py-2.5 border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] transition-colors text-sm cursor-pointer"
            onClick={() => navigate("/read?id=1")}
          >
            <Play size={15} className="text-[var(--accent)]" />
            Interactive Reader Demo
          </Button>
        </motion.div>

        {/* EDITORIAL CARD SHOWCASE — Animated In-View */}
        <motion.div
          ref={showcaseRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full max-w-5xl rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] text-left p-4 sm:p-6"
        >
          {/* Topic Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-3 mb-5 border-b border-[var(--line)]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mr-2 flex items-center gap-1.5">
              <Terminal size={14} className="text-[var(--accent)]" /> Core Topics:
            </span>
            {HERO_TRACKS.map((t, idx) => {
              const isActive = activeTrackIdx === idx;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTrackIdx(idx)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
                    isActive
                      ? "bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold"
                      : "bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.title}</span>
                </button>
              );
            })}
          </div>

          {/* Editorial Showcase Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrack.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
            >
              {/* Code Box with JetBrains Mono */}
              <div className="lg:col-span-7 rounded-[var(--radius-md)] bg-[#141311] border border-[var(--line-strong)] p-5 font-mono text-xs text-[#00E57A] flex flex-col justify-between overflow-x-auto min-h-[240px] shadow-[var(--shadow-sm)]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2E2C27] text-[11px]">
                  <span className="font-bold text-[#00E57A] uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 size={14} /> {activeTrack.tag}
                  </span>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[#00E57A] transition-colors cursor-pointer"
                  >
                    {copied ? <CheckCircle2 size={13} className="text-[#00E57A]" /> : <Copy size={13} />}
                    <span>{copied ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>

                <pre className="whitespace-pre overflow-x-auto leading-relaxed py-2 text-[#EDEAE3] font-mono font-normal flex-1">
                  <code>{typedText}</code>
                  <span className="w-2 h-4 bg-[#00E57A] inline-block animate-pulse ml-0.5" />
                </pre>

                <div className="pt-3 mt-3 border-t border-[#2E2C27] flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#00E57A] font-semibold">
                    <Check size={13} /> Interactive Slide 1 of 4 • Ready
                  </span>
                  <button
                    onClick={() => navigate("/read?id=1")}
                    className="font-bold text-[#00E57A] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Note</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>

              {/* Side Column: Workflow Diagram & Quiz */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] p-4 flex flex-col justify-between flex-1">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5 mb-1.5">
                      <Sparkles size={13} /> Architecture Flow
                    </span>
                    <h4 className="font-serif font-bold text-base text-[var(--ink)] mb-2">
                      {activeTrack.title}
                    </h4>
                    <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--line)] text-xs font-mono text-[var(--accent)] flex items-center justify-center text-center font-medium">
                      {activeTrack.diagram}
                    </div>
                  </div>
                </div>

                <div className="rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--line)] p-4 shadow-[var(--shadow-sm)] space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    <span className="flex items-center gap-1">
                      <HelpCircle size={13} /> Knowledge Checkpoint
                    </span>
                    <span className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)]">1 Ques</span>
                  </div>

                  <p className="text-xs font-semibold text-[var(--ink)]">
                    {activeTrack.quizQuestion}
                  </p>

                  <div className="space-y-1.5">
                    {activeTrack.quizOptions.map((opt, idx) => {
                      const isSelected = selectedQuizIdx === idx;
                      const isCorrect = idx === activeTrack.correctIdx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedQuizIdx(idx)}
                          className={`w-full p-2 rounded-[var(--radius-sm)] text-xs font-semibold text-left transition-all cursor-pointer border ${
                            isSelected
                              ? isCorrect
                                ? "bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold"
                                : "bg-[var(--err-soft)] text-[var(--err)] border-[var(--err)]"
                              : "bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
