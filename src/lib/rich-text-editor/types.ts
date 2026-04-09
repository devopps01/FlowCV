export interface StyledTextSegment {
  id: string;
  text: string;
  style: TextStyle;
}

export interface TextStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  color?: string;
  backgroundColor?: string;
  opacity?: number;
  letterSpacing?: number;
  wordSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export interface ParagraphStyle {
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  textIndent?: number;
  borderTop?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRight?: string;
}

export interface RichTextContent {
  segments: StyledTextSegment[];
  paragraph?: ParagraphStyle;
}

export interface TextElement {
  id: string;
  type: 'text' | 'richtext';
  content: RichTextContent;
  plainText?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: TextStyle;
  autoResize: boolean;
  overflow: 'hidden' | 'scroll' | 'visible';
}

export interface Selection {
  start: number;
  end: number;
  segmentId?: string;
}

export interface EditorState {
  selectedElementId: string | null;
  selection: Selection | null;
  activeFormats: TextStyle;
  isEditing: boolean;
  history: RichTextContent[];
  historyIndex: number;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontSize: 14,
  fontFamily: 'Inter',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#000000',
  backgroundColor: 'transparent',
  opacity: 1,
  letterSpacing: 0,
  wordSpacing: 0,
  lineHeight: 1.4,
  textTransform: 'none',
  textAlign: 'left',
};

export const FONTS = [
  { name: 'Inter', category: 'sans-serif' },
  { name: 'Arial', category: 'sans-serif' },
  { name: 'Helvetica', category: 'sans-serif' },
  { name: 'Georgia', category: 'serif' },
  { name: 'Times New Roman', category: 'serif' },
  { name: 'Courier New', category: 'monospace' },
  { name: 'Roboto', category: 'sans-serif' },
  { name: 'Open Sans', category: 'sans-serif' },
  { name: 'Lato', category: 'sans-serif' },
  { name: 'Montserrat', category: 'sans-serif' },
  { name: 'Poppins', category: 'sans-serif' },
  { name: 'Source Sans Pro', category: 'sans-serif' },
  { name: 'Playfair Display', category: 'serif' },
  { name: 'Merriweather', category: 'serif' },
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96];

export function createStyledSegment(text: string, style?: Partial<TextStyle>): StyledTextSegment {
  return {
    id: `seg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    text,
    style: { ...DEFAULT_TEXT_STYLE, ...style },
  };
}

export function createRichTextContent(segments: StyledTextSegment[]): RichTextContent {
  return { segments };
}

export function mergeStyles(base: TextStyle, override: Partial<TextStyle>): TextStyle {
  return { ...base, ...override };
}

export function splitSegmentAtPosition(
  segment: StyledTextSegment,
  position: number
): [StyledTextSegment, StyledTextSegment] {
  const before = segment.text.slice(0, position);
  const after = segment.text.slice(position);
  
  return [
    { ...segment, id: `${segment.id}-before`, text: before },
    { ...segment, id: `${segment.id}-after`, text: after },
  ];
}

export function getPlainText(content: RichTextContent): string {
  return content.segments.map(s => s.text).join('');
}

export function getCharacterCount(content: RichTextContent): number {
  return getPlainText(content).length;
}

export function getWordCount(content: RichTextContent): number {
  const text = getPlainText(content).trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

export function applyFormatToSelection(
  content: RichTextContent,
  selection: Selection,
  format: Partial<TextStyle>
): RichTextContent {
  const newSegments: StyledTextSegment[] = [];
  let currentIndex = 0;

  for (const segment of content.segments) {
    const segmentStart = currentIndex;
    const segmentEnd = currentIndex + segment.text.length;

    if (selection.end <= segmentStart || selection.start >= segmentEnd) {
      newSegments.push(segment);
    } else {
      const startInSegment = Math.max(0, selection.start - segmentStart);
      const endInSegment = Math.min(segment.text.length, selection.end - segmentStart);

      if (startInSegment > 0) {
        newSegments.push({
          ...segment,
          id: `${segment.id}-${Date.now()}`,
          text: segment.text.slice(0, startInSegment),
        });
      }

      newSegments.push({
        ...segment,
        id: `${segment.id}-${Date.now()}`,
        text: segment.text.slice(startInSegment, endInSegment),
        style: mergeStyles(segment.style, format),
      });

      if (endInSegment < segment.text.length) {
        newSegments.push({
          ...segment,
          id: `${segment.id}-${Date.now()}`,
          text: segment.text.slice(endInSegment),
        });
      }
    }

    currentIndex = segmentEnd;
  }

  return { segments: newSegments.filter(s => s.text.length > 0) };
}

export function insertTextAtPosition(
  content: RichTextContent,
  position: number,
  text: string,
  style?: Partial<TextStyle>
): RichTextContent {
  const newSegments: StyledTextSegment[] = [];
  let currentIndex = 0;

  for (const segment of content.segments) {
    const segmentStart = currentIndex;
    const segmentEnd = currentIndex + segment.text.length;

    if (position <= segmentStart) {
      newSegments.push(segment);
    } else if (position >= segmentEnd) {
      newSegments.push(segment);
    } else {
      const splitPos = position - segmentStart;
      const before = segment.text.slice(0, splitPos);
      const after = segment.text.slice(splitPos);

      if (before) {
        newSegments.push({ ...segment, id: `${segment.id}-${Date.now()}`, text: before });
      }
      
      newSegments.push(createStyledSegment(text, style));
      
      if (after) {
        newSegments.push({ ...segment, id: `${segment.id}-${Date.now()}`, text: after });
      }
    }

    currentIndex = segmentEnd;
  }

  if (newSegments.length === content.segments.length) {
    const lastSegment = newSegments[newSegments.length - 1];
    newSegments[newSegments.length - 1] = {
      ...lastSegment,
      text: lastSegment.text + text,
    };
  }

  return { segments: newSegments };
}

export function deleteTextInRange(
  content: RichTextContent,
  start: number,
  end: number
): RichTextContent {
  const newSegments: StyledTextSegment[] = [];
  let currentIndex = 0;

  for (const segment of content.segments) {
    const segmentStart = currentIndex;
    const segmentEnd = currentIndex + segment.text.length;

    if (end <= segmentStart || start >= segmentEnd) {
      newSegments.push(segment);
    } else if (start <= segmentStart && end >= segmentEnd) {
      continue;
    } else if (start <= segmentStart) {
      newSegments.push({
        ...segment,
        id: `${segment.id}-${Date.now()}`,
        text: segment.text.slice(0, end - segmentStart),
      });
    } else if (end >= segmentEnd) {
      newSegments.push({
        ...segment,
        id: `${segment.id}-${Date.now()}`,
        text: segment.text.slice(start - segmentStart),
      });
    } else {
      const before = segment.text.slice(0, start - segmentStart);
      const after = segment.text.slice(end - segmentStart);

      if (before) {
        newSegments.push({ ...segment, id: `${segment.id}-${Date.now()}`, text: before });
      }
      if (after) {
        newSegments.push({ ...segment, id: `${segment.id}-${Date.now()}`, text: after });
      }
    }

    currentIndex = segmentEnd;
  }

  return { segments: newSegments.filter(s => s.text.length > 0) };
}

export function serializeContent(content: RichTextContent): string {
  return JSON.stringify(content);
}

export function deserializeContent(json: string): RichTextContent {
  try {
    const parsed = JSON.parse(json);
    if (parsed.segments && Array.isArray(parsed.segments)) {
      return parsed;
    }
    return { segments: [createStyledSegment(json)] };
  } catch {
    return { segments: [createStyledSegment(json)] };
  }
}
