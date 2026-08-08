import React from 'react';

export default function HeadingBlock({ block }) {
  if (!block?.content) return null;
  const level = block.level || 2;
  const text = block.content;

  if (level === 1) {
    return <h1 className="heading-block heading-1">{text}</h1>;
  }
  if (level === 3) {
    return <h3 className="heading-block heading-3">{text}</h3>;
  }
  // Default: level 2
  return <h2 className="heading-block heading-2">{text}</h2>;
}
