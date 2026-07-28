import React, { useState } from 'react';
import { FiCheck, FiX, FiHelpCircle } from 'react-icons/fi';

export default function QuizBlock({ question, options = [], answer = 0, explanation = '' }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
    if (selectedIdx === null) return;
    setSubmitted(true);
  };

  const isCorrect = selectedIdx === answer;

  return (
    <div className="my-6 p-5 rounded-2xl border border-border bg-card shadow-md flex flex-col gap-4">
      <div className="flex items-center gap-2 text-primary font-heading font-extrabold text-sm uppercase tracking-wider">
        <FiHelpCircle size={16} /> Concept Knowledge Check
      </div>

      <h4 className="font-heading font-extrabold text-base md:text-lg text-foreground leading-snug">
        {question}
      </h4>

      <div className="flex flex-col gap-2.5">
        {options.map((opt, idx) => {
          let btnStyle = 'border-border bg-muted/30 hover:bg-muted text-foreground';
          if (selectedIdx === idx) {
            btnStyle = 'border-primary bg-primary/10 text-primary font-extrabold';
          }
          if (submitted) {
            if (idx === answer) {
              btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-400 font-extrabold';
            } else if (selectedIdx === idx && idx !== answer) {
              btnStyle = 'border-red-500 bg-red-500/15 text-red-400 font-extrabold';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`w-full p-3.5 rounded-xl border text-left text-xs md:text-sm transition-all cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
            >
              <span>{opt}</span>
              {submitted && idx === answer && <FiCheck className="text-emerald-400 shrink-0" size={16} />}
              {submitted && selectedIdx === idx && idx !== answer && <FiX className="text-red-400 shrink-0" size={16} />}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          className="self-end px-5 py-2 rounded-xl bg-primary disabled:opacity-40 text-black font-extrabold text-xs shadow-sm transition-all cursor-pointer"
        >
          Check Answer
        </button>
      ) : (
        <div className={`p-4 rounded-xl border text-xs md:text-sm font-medium leading-relaxed ${
          isCorrect ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="font-extrabold mb-1">{isCorrect ? '🎉 Correct!' : '❌ Not quite right'}</div>
          {explanation}
        </div>
      )}
    </div>
  );
}
