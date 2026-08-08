import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiHelpCircle, FiInfo } from 'react-icons/fi';

export default function QuizBlock({ block }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  if (!block) return null;

  const question = block.question || 'Knowledge Check';
  const options = Array.isArray(block.options) ? block.options : [];
  const correctAnswer = block.answer ?? 0;
  const explanation = block.explanation || '';

  const handleSelect = (idx) => {
    if (submitted) return;
    setSelectedIdx(idx);
    setSubmitted(true);
  };

  const isCorrect = selectedIdx === correctAnswer;

  const getOptionClass = (idx) => {
    if (!submitted) return 'quiz-option';
    if (idx === correctAnswer) return 'quiz-option quiz-option-correct';
    if (idx === selectedIdx && idx !== correctAnswer) return 'quiz-option quiz-option-wrong';
    return 'quiz-option quiz-option-dim';
  };

  return (
    <div className="quiz-block">
      <div className="quiz-header">
        <span className="quiz-badge">
          <FiHelpCircle size={13} /> Knowledge Check
        </span>
      </div>

      <h3 className="quiz-question">{question}</h3>

      <div className="quiz-options">
        {options.map((opt, idx) => (
          <button
            key={idx}
            disabled={submitted}
            onClick={() => handleSelect(idx)}
            className={getOptionClass(idx)}
          >
            <div className="quiz-option-inner">
              <span className="quiz-option-letter">{String.fromCharCode(65 + idx)}</span>
              <span>{opt}</span>
            </div>
            {submitted && idx === correctAnswer && (
              <FiCheckCircle size={16} className="quiz-icon-correct" />
            )}
            {submitted && idx === selectedIdx && idx !== correctAnswer && (
              <FiXCircle size={16} className="quiz-icon-wrong" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={isCorrect ? 'quiz-result quiz-result-correct' : 'quiz-result quiz-result-wrong'}
          >
            <div className="quiz-result-header">
              <span>
                {isCorrect ? <FiCheckCircle size={15} /> : <FiXCircle size={15} />}
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
              <button
                className="quiz-retry"
                onClick={() => { setSelectedIdx(null); setSubmitted(false); }}
              >
                Try Again
              </button>
            </div>
            {explanation && (
              <p className="quiz-explanation">
                <FiInfo size={13} />
                {explanation}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
