import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './Button.jsx';
import {
  FiArrowRight, FiFeather, FiCode, FiZap,
  FiDatabase, FiCpu, FiLayers, FiCheck,
} from 'react-icons/fi';

const TECH_ORBITS = [
  {
    id: 'csharp',
    title: 'C# & .NET Core',
    icon: FiCode,
    tag: 'Backend & Runtime',
    snippets: ['Task.WhenAll', 'LINQ Queries', 'Dependency Injection'],
    floatDelay: 0,
  },
  {
    id: 'dsa',
    title: 'DSA & Algorithms',
    icon: FiCpu,
    tag: 'Data Structures',
    snippets: ['AVL Trees', 'Graph BFS/DFS', 'Dynamic Programming'],
    floatDelay: 0.8,
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: FiLayers,
    tag: 'Architecture',
    snippets: ['Cache-Aside', 'Rate Limiting', 'Load Balancer'],
    floatDelay: 1.6,
  },
  {
    id: 'sql',
    title: 'SQL & Databases',
    icon: FiDatabase,
    tag: 'Data Engineering',
    snippets: ['B-Tree Indexing', 'ACID Transactions', 'Query Optimization'],
    floatDelay: 2.4,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const navigate = useNavigate();

  const handleTopicClick = () => {
    const el = document.getElementById('notes-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else navigate('/#notes-section');
  };

  return (
    <section className="relative overflow-hidden py-12 md:py-20 px-4 text-center">
      {/* Animated Backdrop */}
      <div className="hero-gradient-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
      </div>
      <div className="absolute inset-0 pointer-events-none hero-noise-overlay" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-6xl mx-auto flex flex-col items-center"
      >
        {/* Domain Badge */}
        <motion.span
          variants={cardVariants}
          className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-[0_0_20px_var(--neon-glow)]"
        >
          <FiZap size={13} />
          <span>notes.phaneendramarri.com</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </motion.span>

        {/* Headline */}
        <motion.h1
          variants={cardVariants}
          className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-6 text-foreground max-w-4xl"
        >
          Visual Engineering Notes{' '}
          <span className="gradient-text">for&nbsp;Software&nbsp;Developers.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={cardVariants}
          className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8"
        >
          Interactive, slide-by-slide study notes for C#, .NET, Data Structures &amp; Algorithms, SQL, and System Design.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={cardVariants}
          className="flex flex-wrap items-center justify-center gap-3.5 mb-14"
        >
          <Button
            size="lg"
            className="rounded-full font-extrabold cursor-pointer gap-2 px-8 py-3.5 shadow-lg shadow-primary/25 text-sm md:text-base"
            variant="neon"
            onClick={handleTopicClick}
          >
            Explore Notes Library
            <FiArrowRight size={18} />
          </Button>

          {Boolean(localStorage.getItem('jwt')) && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-extrabold gap-2 px-7 py-3.5 border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/10 transition-all text-sm md:text-base"
              onClick={() => navigate('/editor')}
            >
              <FiFeather size={18} className="text-primary" />
              Create Note
            </Button>
          )}
        </motion.div>

        {/* Floating Tech Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full max-w-5xl text-left"
        >
          {TECH_ORBITS.map((orbit) => {
            const Icon = orbit.icon;
            return (
              <motion.div
                key={orbit.id}
                variants={cardVariants}
                animate={{
                  y: [0, -8, 0],
                  transition: {
                    y: {
                      duration: 4.5,
                      repeat: Infinity,
                      repeatType: 'mirror',
                      ease: 'easeInOut',
                      delay: orbit.floatDelay,
                    },
                  },
                }}
                whileHover={{ scale: 1.04, y: -10 }}
                onClick={handleTopicClick}
                className="hero-tech-card group"
              >
                <div className="hero-card-glow" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="hero-card-icon-wrap">
                      <Icon size={20} />
                    </div>
                    <span className="hero-card-tag">{orbit.tag}</span>
                  </div>

                  <h3 className="font-heading font-extrabold text-base md:text-lg text-foreground mb-3 group-hover:text-primary transition-colors">
                    {orbit.title}
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    {orbit.snippets.map((snip) => (
                      <span key={snip} className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <FiCheck size={11} className="text-primary shrink-0" />
                        {snip}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Explore Track</span>
                  <FiArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
