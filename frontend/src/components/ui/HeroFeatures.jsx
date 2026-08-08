import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiSearch, FiZap, FiFeather } from 'react-icons/fi';

const FEATURES = [
  {
    icon: FiBookOpen,
    title: 'Visual Slide Reader',
    desc: 'Bite-sized, slide-by-slide note format with code snippets, diagrams, and progress tracking.',
    badge: '1-Min Slides',
  },
  {
    icon: FiSearch,
    title: 'Instant Fuzzy Search (⌘K)',
    desc: 'Instant fuzzy search across engineering titles, concept topics, and code tags with typo tolerance.',
    badge: 'Typo-Tolerant',
  },
  {
    icon: FiZap,
    title: 'Interactive Quizzes & Callouts',
    desc: 'Test your understanding with instant knowledge-check quizzes and key takeaway callouts.',
    badge: 'Real-Time',
  },
  {
    icon: FiFeather,
    title: 'Author Studio Editor',
    desc: 'Visual block-based editor to quickly create, structure, reorder slides, and publish notes.',
    badge: 'Block-Based',
  },
];

export default function HeroFeatures() {
  return (
    <section className="py-12 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          Built for Software Engineers
        </span>
        <h2 className="font-heading font-extrabold text-2xl md:text-4xl text-foreground mt-3">
          Designed for Deep Technical Clarity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-border/80 bg-card hover:border-primary/50 transition-all shadow-xs hover:shadow-lg hover:shadow-primary/10 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                    {f.badge}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-base md:text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {f.title}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
