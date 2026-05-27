export { InlineEditorWrapper } from './InlineEditorWrapper';
export { FloatingPanel } from './FloatingPanel';
export type { EditTarget, StyleOverride, InlineEditorProps, FloatingPanelProps, EditableFieldConfig, ModuleConfig, FieldType } from './types';
export {
  detectFieldType,
  htmlToPlainText,
  plainTextToHtml,
  getFieldLabel,
  getElementStyle,
  saveStyleOverride,
  resetStyleOverride,
} from './utils';