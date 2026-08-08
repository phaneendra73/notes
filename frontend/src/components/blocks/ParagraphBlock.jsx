import React from 'react';
import { renderInlineText } from '../../lib/inline.js';

export default function ParagraphBlock({ block }) {
  if (!block?.content) return null;
  return (
    <p className="paragraph-block">
      {renderInlineText(block.content)}
    </p>
  );
}
