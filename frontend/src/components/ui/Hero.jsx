import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../../api/client.js';
import { Button } from './Button.jsx';
import { FiArrowRight, FiFeather, FiBookOpen, FiEye, FiTag } from 'react-icons/fi';

export default function Hero() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalLessons: 0, totalViews: 0, totalTags: 0 });

  useEffect(() => {
    client
      .get('/api/lessons/stats')
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

  return (
    <section className="relative overflow-hidden py-16 md:py-24 px-4 text-center">
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl opacity-70" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-3xl mx-auto flex flex-col items-center"
      >
        <motion.span
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border/80 bg-card/80 text-muted-foreground text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs"
        >
          Personal Engineering & Tech Notes
        </motion.span>

        <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-4 text-foreground">
          Master C#, .NET, DSA & SQL with Interactive Notes.
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-8">
          A personal study hub to review concepts in C#, .NET Core, Data Structures & Algorithms, SQL, and System Design.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <Button
            size="lg"
            className="rounded-full font-extrabold cursor-pointer gap-2 px-6 shadow-md"
            variant="neon"
            onClick={() => {
              const el = document.getElementById('notes-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/#notes-section');
              }
            }}
          >
            Explore Notes
            <FiArrowRight size={16} />
          </Button>
          {Boolean(localStorage.getItem('jwt')) && (
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-extrabold gap-2 px-6 border-border hover:border-primary/50"
              onClick={() => navigate('/editor')}
            >
              <FiFeather size={16} className="text-primary" />
              New Tech Note
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-border/60 w-full">
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <FiBookOpen size={16} className="text-primary" />
            <strong className="text-foreground font-extrabold text-sm md:text-base">{stats.totalLessons}</strong> Tech Notes
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <FiTag size={16} className="text-sky-400" />
            <strong className="text-foreground font-extrabold text-sm md:text-base">{stats.totalTags}</strong> Topics
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <FiEye size={16} className="text-indigo-400" />
            <strong className="text-foreground font-extrabold text-sm md:text-base">{stats.totalViews}</strong> Reads
          </div>
        </div>
      </motion.div>
    </section>
  );
}
