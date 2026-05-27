export interface EditTarget {
  path: string;
  stylePath: string;
  value: string;
  rect: DOMRect;
  fieldType: 'text' | 'date' | 'textarea' | 'email' | 'tel' | 'url' | 'number' | 'richtext';
  label: string;
  element?: HTMLElement;
  pageIndex?: number;
}

export interface StyleOverride {
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderStyle?: string;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  marginBottom?: number;
  padding?: number;
  boxShadow?: string;
  opacity?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: string;
}

export interface InlineEditorProps {
  data: any;
  updateNested: (path: string, value: any) => void;
  children: React.ReactNode;
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
}

export interface FloatingPanelProps {
  target: EditTarget;
  data: any;
  updateNested: (path: string, value: any) => void;
  onClose: () => void;
  containerRect: DOMRect | null;
  zoom: number;
}

export interface ModuleConfig {
  name: string;
  icon?: string;
  title: string;
  editableFields: EditableFieldConfig[];
}

export interface EditableFieldConfig {
  path: string;
  label: string;
  type: EditTarget['fieldType'];
  containerSelector?: string;
  transformValue?: (val: string) => string;
  transformDisplay?: (val: string) => string;
}

export type FieldType = 'text' | 'date' | 'textarea' | 'email' | 'tel' | 'url' | 'number' | 'richtext';