import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

let toastId = 0;

/**
 * ToastProvider — wraps the app and provides the toast system.
 * Use useToast() to trigger toasts from any component.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(({ title, description, variant = 'default', duration = 3500 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, title, description, variant }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    show,
    success: (title, description) => show({ title, description, variant: 'success' }),
    error: (title, description) => show({ title, description, variant: 'error' }),
    info: (title, description) => show({ title, description, variant: 'info' }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * useToast — returns the toast API.
 * @returns {{ success, error, info, show, dismiss }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const VARIANT_STYLES = {
  success: { icon: FiCheckCircle, cls: 'toast-success' },
  error:   { icon: FiAlertCircle, cls: 'toast-error' },
  info:    { icon: FiInfo,        cls: 'toast-info' },
  default: { icon: FiInfo,        cls: 'toast-default' },
};

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { icon: Icon, cls } = VARIANT_STYLES[t.variant] || VARIANT_STYLES.default;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className={`toast ${cls}`}
              role="alert"
            >
              <Icon size={16} className="toast-icon" />
              <div className="toast-text">
                {t.title && <p className="toast-title">{t.title}</p>}
                {t.description && <p className="toast-desc">{t.description}</p>}
              </div>
              <button
                className="toast-close"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss"
              >
                <FiX size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
