import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle, Info } from "lucide-react";

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
    const base = "w-full px-4 py-3 rounded-[var(--radius-md)] border text-xs sm:text-sm font-semibold text-left cursor-pointer flex items-center justify-between transition-all shadow-[var(--shadow-sm)]";
    if (!submitted) return `${base} border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]`;
    if (idx === correctAnswer) return `${base} border-[var(--ok)] bg-[var(--ok-soft)] text-[var(--ok)] font-bold`;
    if (idx === selectedIdx)   return `${base} border-[var(--err)] bg-[var(--err-soft)] text-[var(--err)] font-bold`;
    return `${base} border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] opacity-50`;
  };

  return (
    <div className="p-5 sm:p-6 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] space-y-4">
      {/* Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-bold uppercase tracking-wider font-sans">
          <HelpCircle size={13} /> Knowledge Check
        </span>
      </div>

      <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug">
        {question}
      </h3>

      <div className="flex flex-col gap-2.5">
        {options.map((opt, idx) => (
          <button
            key={idx}
            disabled={submitted}
            onClick={() => handleSelect(idx)}
            className={optionClass(idx)}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center text-xs font-mono font-bold shrink-0 text-[var(--ink)]">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="truncate">{opt}</span>
            </div>
            {submitted && idx === correctAnswer && <CheckCircle2 size={16} className="text-[var(--ok)] shrink-0 ml-2" />}
            {submitted && idx === selectedIdx && idx !== correctAnswer && <XCircle size={16} className="text-[var(--err)] shrink-0 ml-2" />}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-[var(--radius-md)] border text-xs sm:text-sm ${
              isCorrect
                ? "border-[var(--ok-soft)] bg-[var(--ok-soft)] text-[var(--ok)]"
                : "border-[var(--err-soft)] bg-[var(--err-soft)] text-[var(--err)]"
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                {isCorrect ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                {isCorrect ? "Correct!" : "Incorrect"}
              </span>
              <button
                className="text-xs underline cursor-pointer opacity-85 hover:opacity-100 bg-transparent border-none text-inherit font-semibold"
                onClick={() => { setSelectedIdx(null); setSubmitted(false); }}
              >
                Try Again
              </button>
            </div>
            {explanation && (
              <p className="mt-2 text-xs leading-relaxed flex items-start gap-1.5 text-[var(--ink)] font-normal">
                <Info size={13} className="mt-0.5 shrink-0 text-[var(--muted)]" />
                {explanation}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
