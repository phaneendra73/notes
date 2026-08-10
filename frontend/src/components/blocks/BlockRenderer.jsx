import React from "react";
import HeadingBlock   from "./HeadingBlock.jsx";
import ParagraphBlock from "./ParagraphBlock.jsx";
import CodeBlock      from "./CodeBlock.jsx";
import CalloutBlock   from "./CalloutBlock.jsx";
import QuizBlock      from "./QuizBlock.jsx";
import DiagramBlock   from "./DiagramBlock.jsx";
import ImageBlock     from "./ImageBlock.jsx";
import TableBlock     from "./TableBlock.jsx";
import DividerBlock   from "./DividerBlock.jsx";
import StepsBlock     from "./StepsBlock.jsx";
import KeyValueBlock  from "./KeyValueBlock.jsx";

/**
 * BlockRenderer — maps an ordered array of typed Block objects to React components.
 *
 * This is the single rendering pipeline for both the Lesson Reader and Editor Preview.
 * There is no Markdown parsing here. Blocks are the canonical content representation.
 *
 * @param {object[]} blocks - Array of Block objects
 * @param {function} [onImageClick] - Called with (src) when an image block is clicked
 */
export default function BlockRenderer({ blocks, onImageClick }) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return (
      <div className="py-12 px-6 text-center text-muted-foreground text-[0.9rem] border border-dashed border-border rounded-[1rem]">
        <span>No content yet.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {blocks.map((block, idx) => (
        <BlockItem key={block.id || idx} block={block} onImageClick={onImageClick} />
      ))}
    </div>
  );
}

/**
 * Dispatches a single block to its typed component.
 * Unknown block types render a graceful warning, not a crash.
 */
function BlockItem({ block, onImageClick }) {
  if (!block || !block.type) return null;

  switch (block.type) {
    case "heading":   return <HeadingBlock   block={block} />;
    case "paragraph": return <ParagraphBlock block={block} />;
    case "code":      return <CodeBlock      block={block} />;
    case "callout":   return <CalloutBlock   block={block} />;
    case "quiz":      return <QuizBlock      block={block} />;
    case "diagram":
    case "mermaid":   return <DiagramBlock   block={block} />;
    case "image":     return <ImageBlock     block={block} onImageClick={onImageClick} />;
    case "table":     return <TableBlock     block={block} />;
    case "divider":   return <DividerBlock   block={block} />;
    case "steps":     return <StepsBlock     block={block} />;
    case "keyvalue":  return <KeyValueBlock  block={block} />;

    default:
      if (import.meta.env.DEV) {
        console.warn(`BlockRenderer: unknown block type "${block.type}"`, block);
      }
      return (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[0.8rem]">
          <span>Unknown block type: <code>{block.type}</code></span>
        </div>
      );
  }
}
