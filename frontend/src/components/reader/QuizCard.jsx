import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiHelpCircle, FiRotateCcw } from 'react-icons/fi';
import { Button } from '../ui/Button.jsx';

export default function QuizCard({ rawQuizData }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Parse raw quiz string or JSON
  let quiz = null;
  try {
    const decoded = decodeURIComponent(rawQuizData);
    if (decoded.trim().startsWith('{')) {
      quiz = JSON.parse(decoded);
    } else {
      // Parse key-value block
      const lines = decoded.split('\n');
      let question = '';
      let options = [];
      let answer = 0;
      let explanation = '';

      let currentKey = '';
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('question:')) {
          question = trimmed.replace('question:', '').trim();
        } else if (trimmed.startsWith('options:')) {
          currentKey = 'options';
        } else if (trimmed.startsWith('- ') && currentKey === 'options') {
          options.push(trimmed.substring(2).trim());
        } else if (trimmed.startsWith('answer:')) {
          answer = parseInt(trimmed.replace('answer:', '').trim()) || 0;
        } else if (trimmed.startsWith('explanation:')) {
          explanation = trimmed.replace('explanation:', '').trim();
        }
      });

      quiz = { question, options, answer, explanation };
    }
  } catch (err) {
    console.error('Failed to parse quiz block:', err);
    quiz = {
      question: 'Check your understanding of this section:',
      options: ['Option A (Correct)', 'Option B', 'Option C'],
      answer: 0,
      explanation: 'Great job reviewing this topic!',
    };
  }

  const isCorrect = selectedOption === quiz.answer;

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-8 p-6 rounded-2xl border border-primary/30 bg-card shadow-[0_12px_40px_rgba(2,6,23,0.06)]"
      style={{ background: 'linear-gradient(145deg, var(--card), rgba(0, 201, 110, 0.04))' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 text-primary font-bold text-sm uppercase tracking-wider">
        <FiHelpCircle size={18} />
        <span>Knowledge Check Quiz</span>
      </div>

      {/* Question */}
      <h3 className="font-heading font-extrabold text-lg text-foreground mb-5 leading-snug">
        {quiz.question || 'Question:'}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-3 mb-6">
        {(quiz.options || []).map((opt, idx) => {
          const isSelected = selectedOption === idx;
          let btnClass = 'border-border bg-background hover:border-primary/50 text-foreground';

          if (submitted) {
            if (idx === quiz.answer) {
              btnClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
            } else if (isSelected && !isCorrect) {
              btnClass = 'border-red-500 bg-red-500/10 text-red-500 font-semibold';
            } else {
              btnClass = 'border-border/40 opacity-60 text-muted-foreground';
            }
          } else if (isSelected) {
            btnClass = 'border-primary bg-primary/10 text-primary font-bold shadow-sm';
          }

          return (
            <button
              key={idx}
              disabled={submitted}
              onClick={() => setSelectedOption(idx)}
              className={`flex items-center justify-between p-4 rounded-xl border text-left text-sm transition-all duration-200 cursor-pointer ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>

              {submitted && idx === quiz.answer && <FiCheckCircle className="text-emerald-500 shrink-0" size={18} />}
              {submitted && isSelected && !isCorrect && <FiXCircle className="text-red-500 shrink-0" size={18} />}
            </button>
          );
        })}
      </div>

      {/* Action / Feedback Footer */}
      {!submitted ? (
        <Button
          disabled={selectedOption === null}
          onClick={() => setSubmitted(true)}
          className="w-full sm:w-auto h-10 px-6 rounded-xl font-bold"
        >
          Check Answer
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col gap-4">
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-medium leading-relaxed flex items-start gap-3 ${
              isCorrect ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}
          >
            {isCorrect ? <FiCheckCircle size={20} className="shrink-0 mt-0.5" /> : <FiXCircle size={20} className="shrink-0 mt-0.5" />}
            <div>
              <p className="font-extrabold text-sm mb-1">{isCorrect ? 'Correct! Excellent job.' : 'Not quite right.'}</p>
              <p>{quiz.explanation || (isCorrect ? 'You understood the core concept!' : 'Review the slide details and try again.')}</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} className="self-start gap-2 rounded-xl">
            <FiRotateCcw size={14} /> Try Again
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
