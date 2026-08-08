import React from 'react';
import { FiZap, FiAlertTriangle, FiInfo, FiBookmark } from 'react-icons/fi';
import { renderInlineText } from '../../lib/inline.js';

const VARIANTS = {
  tip: {
    Icon: FiZap,
    label: 'Key Takeaway',
    className: 'callout-tip',
  },
  warning: {
    Icon: FiAlertTriangle,
    label: 'Warning',
    className: 'callout-warning',
  },
  info: {
    Icon: FiInfo,
    label: 'Info',
    className: 'callout-info',
  },
  note: {
    Icon: FiBookmark,
    label: 'Note',
    className: 'callout-note',
  },
};

export default function CalloutBlock({ block }) {
  if (!block) return null;
  const calloutVariant = block.variant || 'tip';
  const style = VARIANTS[calloutVariant] || VARIANTS.tip;
  const { Icon } = style;
  const label = block.title || style.label;
  const text = block.content || '';

  return (
    <div className={`callout-block ${style.className}`}>
      <div className="callout-header">
        <Icon size={15} />
        <span>{label}</span>
      </div>
      <div className="callout-body">
        {renderInlineText(text)}
      </div>
    </div>
  );
}
