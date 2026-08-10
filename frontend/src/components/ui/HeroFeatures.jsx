import React from "react";
import { motion } from "framer-motion";
import { Sliders, Cpu, Code2, Zap, CheckCircle2, Monitor } from "lucide-react";

const FEATURES = [
  {
    icon: Sliders,
    title: "Bite-Sized Visual Notes",
    desc: "Complex software topics broken down into slide-by-slide visual notes for instant retention.",
    tag: "Visual Memory",
  },
  {
    icon: Cpu,
    title: "System Architecture Workflows",
    desc: "Clear visual diagrams mapping thread scheduling, Redis cache-aside, and SQL B-Tree indexes.",
    tag: "Deep Systems",
  },
  {
    icon: Code2,
    title: "Production-Grade Snippets",
    desc: "Actual C# 12, .NET 8, and Data Structure implementations ready to paste and study.",
    tag: "Production Code",
  },
  {
    icon: Monitor,
    title: "Immersive Keyboard Reader",
    desc: "Navigate notes effortlessly with Arrow keys, spacebar, outline drawers, and full-screen focus.",
    tag: "Keyboard First",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function HeroFeatures() {
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 bg-[var(--bg)] border-b border-[var(--line)]">
      <div className="max-w-[var(--maxw)] mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[var(--radius-sm)] border border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold uppercase tracking-widest mb-4">
            <Zap size={14} className="text-[var(--accent)]" />
            <span>Built for Modern Software Engineers</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--ink)] mb-4">
            Why Learn with Visual Study Notes?
          </h2>
          <p className="font-sans text-[var(--ink-2)] text-base font-normal leading-relaxed">
            Stop scrolling through endless text documentation. Master complex engineering concepts faster with slide-by-slide visual notes.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group relative rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-6 transition-all duration-[var(--dur)] ease-[var(--ease)] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-md)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center transition-colors">
                      <Icon size={18} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                      {feat.tag}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[var(--ink)] mb-2 group-hover:text-[var(--accent)] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="font-sans text-[var(--ink-2)] text-xs sm:text-sm leading-relaxed font-normal">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-[var(--line)] flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent)]">
                  <CheckCircle2 size={13} />
                  <span>Interactive Note Ready</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
