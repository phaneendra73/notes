import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import client from "../../api/client.js";
import { Button } from "./Button.jsx";
import {
  FiArrowRight,
  FiFeather,
  FiBookOpen,
  FiEye,
  FiTag,
  FiCode,
  FiZap,
  FiDatabase,
  FiCpu,
  FiLayers,
  FiCheck,
} from "react-icons/fi";

const TECH_ORBITS = [
  {
    id: "csharp",
    title: "C# & .NET Core",
    icon: FiCode,
    tag: "Backend & Runtime",
    snippets: ["Task.WhenAll", "LINQ Queries", "Dependency Injection"],
    gradient: "from-emerald-500/20 to-primary/10",
    delay: 0,
  },
  {
    id: "dsa",
    title: "DSA & Algorithms",
    icon: FiCpu,
    tag: "Data Structures",
    snippets: ["AVL Trees", "Graph BFS/DFS", "Dynamic Programming"],
    gradient: "from-primary/20 to-green-500/10",
    delay: 0.2,
  },
  {
    id: "system-design",
    title: "System Design",
    icon: FiLayers,
    tag: "Architecture",
    snippets: ["Cache-Aside", "Rate Limiting", "Load Balancer"],
    gradient: "from-emerald-400/20 to-teal-500/10",
    delay: 0.4,
  },
  {
    id: "sql",
    title: "SQL & Databases",
    icon: FiDatabase,
    tag: "Data Engineering",
    snippets: ["B-Tree Indexing", "ACID Transactions", "Query Optimization"],
    gradient: "from-green-400/20 to-primary/10",
    delay: 0.6,
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLessons: 0,
    totalViews: 0,
    totalTags: 0,
  });

  useEffect(() => {
    client
      .get("/api/lessons/stats")
      .then((res) => {
        if (res.data) {
          setStats({
            totalLessons: res.data.totalLessons || 0,
            totalViews: res.data.totalViews || 0,
            totalTags: res.data.totalTags || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleTopicClick = () => {
    const el = document.getElementById("notes-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/#notes-section");
  };

  return (
    <section className="relative overflow-hidden py-14 md:py-24 px-4 text-center">
      {/* Background Animated Neon Mesh */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[650px] h-[650px] rounded-full bg-primary/10 blur-[140px] opacity-75 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 max-w-6xl mx-auto flex flex-col items-center"
      >
        {/* Domain Badge */}
        <motion.span
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-[0_0_15px_var(--neon-glow)]"
        >
          <FiZap size={14} /> Notes.phaneendramarri.com
        </motion.span>

        {/* Animated Headline */}
        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6 text-foreground max-w-4xl">
          Visual Engineering Notes for{" "}
          <span className="gradient-text">Software Developers.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          Interactive slide-by-slide study notes for C#, .NET, Data Structures &
          Algorithms, SQL, and System Design.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
          <Button
            size="lg"
            className="rounded-full font-extrabold cursor-pointer gap-2 px-8 py-3.5 shadow-lg shadow-primary/25 text-sm md:text-base"
            variant="neon"
            onClick={handleTopicClick}
          >
            Explore Notes Library
            <FiArrowRight size={18} />
          </Button>

          {Boolean(localStorage.getItem("jwt")) && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-extrabold gap-2 px-7 py-3.5 border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all text-sm md:text-base"
              onClick={() => navigate("/editor")}
            >
              <FiFeather size={18} className="text-primary" />
              Create Note
            </Button>
          )}
        </div>

        {/* ── ANIMATED FLOATING TECH CARDS MESH ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl mb-16 text-left">
          {TECH_ORBITS.map((orbit) => {
            const Icon = orbit.icon;
            return (
              <motion.div
                key={orbit.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: [0, -8, 0],
                }}
                transition={{
                  opacity: { duration: 0.5, delay: orbit.delay },
                  y: {
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: orbit.delay,
                  },
                }}
                whileHover={{ scale: 1.03, y: -10 }}
                onClick={handleTopicClick}
                className={`p-6 rounded-[22px] border border-border/80 bg-card/90 backdrop-blur-xl shadow-lg hover:border-primary/50 hover:shadow-[0_0_25px_var(--neon-glow)] transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Background Card Subtle Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${orbit.gradient} opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shadow-xs">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border/50">
                      {orbit.tag}
                    </span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base md:text-lg text-foreground mb-3 group-hover:text-primary transition-colors">
                    {orbit.title}
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    {orbit.snippets.map((snip) => (
                      <span
                        key={snip}
                        className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                      >
                        <FiCheck size={12} className="text-primary shrink-0" />
                        {snip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                  <span>Explore Track</span>
                  <FiArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Platform Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 pt-8 border-t border-border/60 w-full">
          <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <FiBookOpen size={18} />
            </div>
            <div className="flex flex-col text-left">
              <strong className="text-foreground font-extrabold text-lg md:text-xl leading-tight">
                {stats.totalLessons || 12}+
              </strong>
              <span className="text-xs font-semibold text-muted-foreground">
                Notes Library
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <FiTag size={18} />
            </div>
            <div className="flex flex-col text-left">
              <strong className="text-foreground font-extrabold text-lg md:text-xl leading-tight">
                {stats.totalTags || 8}+
              </strong>
              <span className="text-xs font-semibold text-muted-foreground">
                Subject Topics
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm text-muted-foreground">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <FiEye size={18} />
            </div>
            <div className="flex flex-col text-left">
              <strong className="text-foreground font-extrabold text-lg md:text-xl leading-tight">
                {stats.totalViews || 150}+
              </strong>
              <span className="text-xs font-semibold text-muted-foreground">
                Note Reads
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
