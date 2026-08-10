import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiXCircle, FiHelpCircle, FiInfo } from "react-icons/fi";

export default function QuizBlock({ block }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted,   setSubmitted]   = useState(false);
  if (!block) return null;

  const question     = block.question || "Knowledge Check";
  const options      = Array.isArray(block.options) ? block.options : [];
  const correctAnswer = block.answer ?? 0;
  const explanation  = block.explanation || "";
  const isCorrect    = selectedIdx === correctAnswer;

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelectedIdx(idx);
    setSubmitted(true);
  };

  const optionClass = (idx) => {
    const base = "w-full px-4 py-[0.85rem] rounded-[1rem] border text-sm font-bold text-left cursor-pointer flex items-center justify-between transition-all";
    if (!submitted) return `${base} border-border bg-background text-foreground hover:border-primary`;
    if (idx === correctAnswer) return `${base} border-emerald-500 bg-emerald-500/15 text-emerald-400`;
    if (idx === selectedIdx)   return `${base} border-rose-500 bg-rose-500/15 text-rose-400`;
    return `${base} border-border bg-background text-foreground opacity-40`;
  };

  return (
    <div className="p-6 rounded-[1.5rem] border border-primary/35 bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
      {/* Badge */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--neon-subtle)] border border-primary/30 text-primary text-[0.7rem] font-black uppercase tracking-widest">
          <FiHelpCircle size={13} /> Knowledge Check
        </span>
      </div>

      <h3 className="font-heading font-extrabold text-[1.1rem] text-foreground mb-4 leading-[1.35]">
        {question}
      </h3>

      <div className="flex flex-col gap-2.5 mb-4">
        {options.map((opt, idx) => (
          <button
            key={idx}
            disabled={submitted}
            onClick={() => handleSelect(idx)}
            className={optionClass(idx)}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[0.7rem] font-black shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </div>
            {submitted && idx === correctAnswer && <FiCheckCircle size={16} className="text-emerald-400" />}
            {submitted && idx === selectedIdx && idx !== correctAnswer && <FiXCircle size={16} className="text-rose-400" />}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-[1rem] border text-sm ${
              isCorrect
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/40 bg-rose-500/10 text-rose-400"
            }`}
          >
            <div className="flex items-center justify-between font-extrabold">
              <span className="flex items-center gap-1.5">
                {isCorrect ? <FiCheckCircle size={15} /> : <FiXCircle size={15} />}
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
              <button
                className="text-[0.7rem] underline cursor-pointer opacity-80 hover:opacity-100 bg-transparent border-none text-inherit"
                onClick={() => { setSelectedIdx(null); setSubmitted(false); }}
              >
                Try Again
              </button>
            </div>
            {explanation && (
              <p className="mt-2 text-[0.8rem] flex items-start gap-1.5 text-foreground">
                <FiInfo size={13} className="mt-0.5 shrink-0" />
                {explanation}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
