import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card.jsx';
import { Badge } from './Badge.jsx';
import { FiClock, FiArrowUpRight } from 'react-icons/fi';

export default function BlogCard({ blog }) {
  const navigate = useNavigate();
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={() => navigate(`/Read?id=${blog.id}`)}
      className="cursor-pointer h-full flex flex-col group"
    >
      <Card className="h-full flex flex-col overflow-hidden border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 rounded-[22px] hover:shadow-[0_18px_56px_rgba(2,6,23,0.08)]">
        {/* Image wrapper */}
        <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
          <img
            src={blog.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider text-white/95 shadow-sm">
            <FiClock className="text-primary w-3 h-3" />
            4 Min
          </div>
        </div>

        <CardContent className="flex-1 flex flex-col p-5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(blog.tags?.length ? blog.tags : ['Stories']).slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline" className="border-primary/20 bg-primary/5 text-primary text-[9px] px-2 py-0.5">{tag}</Badge>
            ))}
          </div>

          {/* Title */}
          <h3 className="font-heading font-extrabold text-base text-foreground leading-snug mb-3 tracking-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {blog.title}
          </h3>

          <div className="flex-1" />

          {/* Card Footer info */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/70 text-xs text-muted-foreground font-medium">
            <span>{date}</span>
            <span className="flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform duration-200">
              Read <FiArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
