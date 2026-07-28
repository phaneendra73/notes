import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function CalloutBlock({ type = 'info', content = '' }) {
  return (
    <div className="my-4 p-4 rounded-2xl bg-primary/10 border border-primary/30 text-foreground flex items-start gap-3 shadow-xs">
      <div className="p-1.5 rounded-xl bg-primary/20 text-primary shrink-0 mt-0.5">
        <FiInfo size={18} />
      </div>
      <div className="text-xs md:text-sm leading-relaxed font-medium">
        {content}
      </div>
    </div>
  );
}
