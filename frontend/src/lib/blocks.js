/**
 * Block type definitions and default factory functions for the Notes content model.
 *
 * Every note page is an ordered array of Block objects.
 * Blocks are the only content representation — there is no Markdown in the pipeline.
 *
 * Block schema:
 *   { type: BlockType, ...type-specific fields }
 */

export const BLOCK_TYPES = {
  HEADING:   'heading',
  PARAGRAPH: 'paragraph',
  CODE:      'code',
  CALLOUT:   'callout',
  QUIZ:      'quiz',
  DIAGRAM:   'diagram',
  IMAGE:     'image',
  TABLE:     'table',
  DIVIDER:   'divider',
  STEPS:     'steps',
  KEYVALUE:  'keyvalue',
};

/**
 * Human-readable label for each block type — used in the BlockPicker UI.
 */
export const BLOCK_LABELS = {
  heading:   'Heading',
  paragraph: 'Paragraph',
  code:      'Code Block',
  callout:   'Callout',
  quiz:      'Quiz',
  diagram:   'Diagram',
  image:     'Image',
  table:     'Table',
  divider:   'Divider',
  steps:     'Steps',
  keyvalue:  'Key / Value',
};

/**
 * Icon name (react-icons/fi) for each block type — used in BlockPicker.
 */
export const BLOCK_ICONS = {
  heading:   'FiType',
  paragraph: 'FiAlignLeft',
  code:      'FiCode',
  callout:   'FiZap',
  quiz:      'FiCheckSquare',
  diagram:   'FiGitBranch',
  image:     'FiImage',
  table:     'FiGrid',
  divider:   'FiMinus',
  steps:     'FiList',
  keyvalue:  'FiColumns',
};

/**
 * Description shown in the BlockPicker dropdown.
 */
export const BLOCK_DESCRIPTIONS = {
  heading:   'Section heading (H2 or H3)',
  paragraph: 'Text with bold, italic, code, and link formatting',
  code:      'Syntax-highlighted code block',
  callout:   'Highlighted tip, warning, note, or info box',
  quiz:      'Interactive multiple-choice knowledge check',
  diagram:   'Mermaid diagram (flowchart, sequence, class, etc.)',
  image:     'Image from media library or external URL',
  table:     'Structured data table with headers and rows',
  divider:   'Visual horizontal rule to separate sections',
  steps:     'Numbered step-by-step list for tutorials or procedures',
  keyvalue:  'Key/value pairs for definitions or comparisons',
};

/**
 * Returns a fresh default block for a given type.
 * Used when the author adds a new block from the BlockPicker.
 */
export function createDefaultBlock(type) {
  switch (type) {
    case BLOCK_TYPES.HEADING:
      return { type: 'heading', level: 2, content: 'New Section' };

    case BLOCK_TYPES.PARAGRAPH:
      return { type: 'paragraph', content: '' };

    case BLOCK_TYPES.CODE:
      return { type: 'code', language: 'csharp', content: '// Write your code here' };

    case BLOCK_TYPES.CALLOUT:
      return { type: 'callout', variant: 'tip', content: 'Key insight or important note.' };

    case BLOCK_TYPES.QUIZ:
      return {
        type: 'quiz',
        question: 'What is the output of the following code?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        explanation: '',
      };

    case BLOCK_TYPES.DIAGRAM:
      return {
        type: 'diagram',
        content: 'graph TD\n    A[Start] --> B[Process]\n    B --> C[End]',
      };

    case BLOCK_TYPES.IMAGE:
      return {
        type: 'image',
        content: '',
        caption: '',
        size: 'medium',
        align: 'center',
      };

    case BLOCK_TYPES.TABLE:
      return {
        type: 'table',
        caption: '',
        headers: ['Column 1', 'Column 2', 'Column 3'],
        rows: [['', '', ''], ['', '', '']],
        striped: true,
        bordered: true,
      };

    case BLOCK_TYPES.DIVIDER:
      return {
        type: 'divider',
        label: '',
        style: 'solid',
      };

    case BLOCK_TYPES.STEPS:
      return {
        type: 'steps',
        title: '',
        items: ['First step', 'Second step', 'Third step'],
      };

    case BLOCK_TYPES.KEYVALUE:
      return {
        type: 'keyvalue',
        title: '',
        layout: 'list',
        pairs: [
          { key: 'Term', value: 'Definition' },
          { key: 'Term', value: 'Definition' },
        ],
      };

    default:
      return { type: 'paragraph', content: '' };
  }
}

/**
 * Callout variants with their display properties.
 */
export const CALLOUT_VARIANTS = {
  tip:     { label: 'Tip',     emoji: '💡', colorClass: 'callout-tip' },
  warning: { label: 'Warning', emoji: '⚠️', colorClass: 'callout-warning' },
  info:    { label: 'Info',    emoji: 'ℹ️', colorClass: 'callout-info' },
  note:    { label: 'Note',    emoji: '📝', colorClass: 'callout-note' },
};

/**
 * Supported programming languages for the code block language selector.
 */
export const CODE_LANGUAGES = [
  { value: 'csharp',     label: 'C#' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python',     label: 'Python' },
  { value: 'java',       label: 'Java' },
  { value: 'sql',        label: 'SQL' },
  { value: 'bash',       label: 'Bash' },
  { value: 'json',       label: 'JSON' },
  { value: 'yaml',       label: 'YAML' },
  { value: 'html',       label: 'HTML' },
  { value: 'css',        label: 'CSS' },
  { value: 'go',         label: 'Go' },
  { value: 'rust',       label: 'Rust' },
  { value: 'text',       label: 'Plain Text' },
];

/**
 * Ordered list of block types shown in the BlockPicker.
 */
export const BLOCK_PICKER_ORDER = [
  BLOCK_TYPES.HEADING,
  BLOCK_TYPES.PARAGRAPH,
  BLOCK_TYPES.CODE,
  BLOCK_TYPES.CALLOUT,
  BLOCK_TYPES.QUIZ,
  BLOCK_TYPES.TABLE,
  BLOCK_TYPES.STEPS,
  BLOCK_TYPES.KEYVALUE,
  BLOCK_TYPES.DIAGRAM,
  BLOCK_TYPES.IMAGE,
  BLOCK_TYPES.DIVIDER,
];
