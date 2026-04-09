'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, Textbox, Rect, Circle, Line, FabricImage, FabricObject, TEvent } from 'fabric';

export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle' | 'line';
  content?: string;
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  style: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    color?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    textAlign?: 'left' | 'center' | 'right';
    lineHeight?: number;
    letterSpacing?: number;
    opacity: number;
  };
}

interface FabricCanvasProps {
  initialElements?: CanvasElement[];
  onElementsChange?: (elements: Record<string, CanvasElement>, order: string[]) => void;
  onSelectionChange?: (ids: string[]) => void;
  onElementUpdate?: (id: string, updates: Partial<CanvasElement>) => void;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export const FabricCanvas: React.FC<FabricCanvasProps> = ({
  initialElements = [],
  onElementsChange,
  onSelectionChange,
  onElementUpdate,
  width = 595,
  height = 842,
  backgroundColor = '#ffffff'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const elementsRef = useRef<Record<string, CanvasElement>>({});
  const orderRef = useRef<string[]>([]);

  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor,
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    canvas.on('selection:created', (e: any) => {
      const selected = (e.selected || []).map((obj: any) => obj.id).filter(Boolean);
      setSelectedIds(selected);
      onSelectionChange?.(selected);
      updateTextControls(canvas, selected);
    });

    canvas.on('selection:updated', (e: any) => {
      const selected = (e.selected || []).map((obj: any) => obj.id).filter(Boolean);
      setSelectedIds(selected);
      onSelectionChange?.(selected);
      updateTextControls(canvas, selected);
    });

    canvas.on('selection:cleared', () => {
      setSelectedIds([]);
      onSelectionChange?.([]);
    });

    canvas.on('object:modified', (e: any) => {
      const obj = e.target;
      if (!obj) return;
      
      const id = obj.id;
      if (!id) return;

      const updates: Partial<CanvasElement> = {
        x: obj.left || 0,
        y: obj.top || 0,
        width: (obj.width || 0) * (obj.scaleX || 1),
        height: (obj.height || 0) * (obj.scaleY || 1),
        rotation: obj.angle || 0,
      };

      if (obj.type === 'textbox') {
        updates.style = {
          fontSize: obj.fontSize,
          fontFamily: obj.fontFamily,
          fontWeight: obj.fontWeight,
          fontStyle: obj.fontStyle,
          color: obj.fill,
          textAlign: obj.textAlign,
          opacity: obj.opacity || 1,
        };
      }

      elementsRef.current[id] = { ...elementsRef.current[id], ...updates };
      onElementUpdate?.(id, updates);
    });

    canvas.on('text:changed', (e: any) => {
      const obj = e.target;
      if (!obj) return;
      
      const id = obj.id;
      if (!id) return;

      const content = obj.text || '';
      elementsRef.current[id] = { ...elementsRef.current[id], content };
      onElementUpdate?.(id, { content });
    });

    return () => {
      canvas.dispose();
    };
  }, [width, height, backgroundColor, onSelectionChange, onElementUpdate]);

  const updateTextControls = (canvas: Canvas, selected: string[]) => {
    if (selected.length !== 1) return;
    
    const obj = canvas.getObjects().find(o => (o as any).id === selected[0]);
    if (obj && obj.type === 'textbox') {
      const textObj = obj as any;
      setFontSize(textObj.fontSize || 14);
      setFontColor(textObj.fill || '#000000');
      setIsBold(textObj.fontWeight === 'bold');
      setIsItalic(textObj.fontStyle === 'italic');
      setTextAlign(textObj.textAlign || 'left');
    }
  };

  useEffect(() => {
    if (!fabricRef.current || initialElements.length === 0) return;

    const canvas = fabricRef.current;
    
    initialElements.forEach(element => {
      addElementToCanvas(canvas, element);
    });

    elementsRef.current = initialElements.reduce((acc, el) => ({ ...acc, [el.id]: el }), {});
    orderRef.current = initialElements.map(el => el.id);
  }, [initialElements]);

  const addElementToCanvas = useCallback((canvas: Canvas, element: CanvasElement) => {
    let obj: FabricObject | null = null;

    if (element.type === 'text') {
      const textObj = new Textbox(element.content || 'Text', {
        left: element.x,
        top: element.y,
        fontSize: element.style.fontSize || 14,
        fontFamily: element.style.fontFamily || 'Arial',
        fontWeight: (element.style.fontWeight as any) || 'normal',
        fontStyle: (element.style.fontStyle as any) || 'normal',
        fill: element.style.color || '#000000',
        textAlign: element.style.textAlign || 'left',
        opacity: element.style.opacity || 1,
        selectable: !element.locked,
        editable: !element.locked,
      });
      textObj.set({
        lockMovementX: element.locked,
        lockMovementY: element.locked,
        lockRotation: element.locked,
        lockScalingX: element.locked,
        lockScalingY: element.locked,
      });
      obj = textObj;
    } else if (element.type === 'rect') {
      const rectObj = new Rect({
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        fill: element.style.backgroundColor || '#cccccc',
        stroke: element.style.borderColor,
        strokeWidth: element.style.borderWidth,
        rx: element.style.borderRadius,
        ry: element.style.borderRadius,
        opacity: element.style.opacity || 1,
        selectable: !element.locked,
      });
      rectObj.set({
        lockMovementX: element.locked,
        lockMovementY: element.locked,
        lockRotation: element.locked,
        lockScalingX: element.locked,
        lockScalingY: element.locked,
      });
      obj = rectObj;
    } else if (element.type === 'circle') {
      const circleObj = new Circle({
        left: element.x,
        top: element.y,
        radius: Math.min(element.width, element.height) / 2,
        fill: element.style.backgroundColor || '#cccccc',
        stroke: element.style.borderColor,
        strokeWidth: element.style.borderWidth,
        opacity: element.style.opacity || 1,
        selectable: !element.locked,
      });
      circleObj.set({
        lockMovementX: element.locked,
        lockMovementY: element.locked,
        lockRotation: element.locked,
        lockScalingX: element.locked,
        lockScalingY: element.locked,
      });
      obj = circleObj;
    } else if (element.type === 'line') {
      const lineObj = new Line([0, element.height / 2, element.width, element.height / 2], {
        left: element.x,
        top: element.y,
        stroke: element.style.color || '#000000',
        strokeWidth: element.style.borderWidth || 2,
        selectable: !element.locked,
      });
      lineObj.set({
        lockMovementX: element.locked,
        lockMovementY: element.locked,
        lockRotation: element.locked,
        lockScalingX: element.locked,
        lockScalingY: element.locked,
      });
      obj = lineObj;
    } else if (element.type === 'image' && element.src) {
      FabricImage.fromURL(element.src, {
        crossOrigin: 'anonymous'
      }).then((img) => {
        img.set({
          left: element.x,
          top: element.y,
          scaleX: element.width / (img.width || 1),
          scaleY: element.height / (img.height || 1),
          selectable: !element.locked,
        });
        (img as any).id = element.id;
        canvas.add(img);
        canvas.renderAll();
      });
      return;
    }

    if (obj) {
      (obj as any).id = element.id;
      obj.set('zIndex', element.zIndex);
      obj.set('visible', element.visible);
      canvas.add(obj);
      canvas.renderAll();
    }
  }, []);

  const handleDoubleClick = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject() as any;
    if (activeObj && activeObj.type === 'textbox') {
      activeObj.enterEditing();
      activeObj.selectAll();
    }
  }, []);

  const addText = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const id = `text-${Date.now()}`;
    const element: CanvasElement = {
      id,
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      rotation: 0,
      zIndex: orderRef.current.length,
      locked: false,
      visible: true,
      style: {
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'left',
        opacity: 1,
      }
    };

    addElementToCanvas(canvas, element);
    elementsRef.current[id] = element;
    orderRef.current.push(id);
    onElementsChange?.({ ...elementsRef.current }, [...orderRef.current]);
  }, [addElementToCanvas, onElementsChange]);

  const addRect = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const id = `rect-${Date.now()}`;
    const element: CanvasElement = {
      id,
      type: 'rect',
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      rotation: 0,
      zIndex: orderRef.current.length,
      locked: false,
      visible: true,
      style: {
        backgroundColor: '#e0e0e0',
        borderColor: '#999999',
        borderWidth: 1,
        opacity: 1,
      }
    };

    addElementToCanvas(canvas, element);
    elementsRef.current[id] = element;
    orderRef.current.push(id);
    onElementsChange?.({ ...elementsRef.current }, [...orderRef.current]);
  }, [addElementToCanvas, onElementsChange]);

  const addCircle = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const id = `circle-${Date.now()}`;
    const element: CanvasElement = {
      id,
      type: 'circle',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: orderRef.current.length,
      locked: false,
      visible: true,
      style: {
        backgroundColor: '#4a90d9',
        opacity: 1,
      }
    };

    addElementToCanvas(canvas, element);
    elementsRef.current[id] = element;
    orderRef.current.push(id);
    onElementsChange?.({ ...elementsRef.current }, [...orderRef.current]);
  }, [addElementToCanvas, onElementsChange]);

  const addLine = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const id = `line-${Date.now()}`;
    const element: CanvasElement = {
      id,
      type: 'line',
      x: 100,
      y: 100,
      width: 200,
      height: 2,
      rotation: 0,
      zIndex: orderRef.current.length,
      locked: false,
      visible: true,
      style: {
        color: '#000000',
        borderWidth: 2,
        opacity: 1,
      }
    };

    addElementToCanvas(canvas, element);
    elementsRef.current[id] = element;
    orderRef.current.push(id);
    onElementsChange?.({ ...elementsRef.current }, [...orderRef.current]);
  }, [addElementToCanvas, onElementsChange]);

  const deleteSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach(obj => {
      const id = (obj as any).id;
      if (id) {
        delete elementsRef.current[id];
        orderRef.current = orderRef.current.filter(oid => oid !== id);
      }
      canvas.remove(obj);
    });

    canvas.discardActiveObject();
    canvas.renderAll();
    onElementsChange?.({ ...elementsRef.current }, [...orderRef.current]);
    setSelectedIds([]);
  }, [onElementsChange]);

  const duplicateSelected = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    (activeObj as any).clone().then((cloned: any) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });

      const id = `${activeObj.type}-${Date.now()}`;
      cloned.id = id;

      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();

      const newElement: CanvasElement = {
        id,
        type: activeObj.type === 'textbox' ? 'text' : activeObj.type as any,
        content: activeObj.type === 'textbox' ? (activeObj as any).text : undefined,
        x: cloned.left || 0,
        y: cloned.top || 0,
        width: cloned.width || 100,
        height: cloned.height || 100,
        rotation: cloned.angle || 0,
        zIndex: orderRef.current.length,
        locked: false,
        visible: true,
        style: elementsRef.current[(activeObj as any).id]?.style || { opacity: 1 }
      };

      elementsRef.current[id] = newElement;
      orderRef.current.push(id);
      onElementsChange?.({ ...elementsRef.current }, [...orderRef.current]);
    });
  }, [onElementsChange]);

  const applyTextFormat = useCallback((format: 'bold' | 'italic' | 'left' | 'center' | 'right') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject() as any;
    if (!activeObj || activeObj.type !== 'textbox') return;

    if (format === 'bold') {
      activeObj.set('fontWeight', activeObj.fontWeight === 'bold' ? 'normal' : 'bold');
      setIsBold(activeObj.fontWeight === 'bold');
    } else if (format === 'italic') {
      activeObj.set('fontStyle', activeObj.fontStyle === 'italic' ? 'normal' : 'italic');
      setIsItalic(activeObj.fontStyle === 'italic');
    } else if (format === 'left') {
      activeObj.set('textAlign', 'left');
      setTextAlign('left');
    } else if (format === 'center') {
      activeObj.set('textAlign', 'center');
      setTextAlign('center');
    } else if (format === 'right') {
      activeObj.set('textAlign', 'right');
      setTextAlign('right');
    }

    canvas.renderAll();
  }, []);

  const handleFontSizeChange = useCallback((size: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject() as any;
    if (!activeObj || activeObj.type !== 'textbox') return;

    activeObj.set('fontSize', size);
    canvas.renderAll();
    setFontSize(size);
  }, []);

  const handleColorChange = useCallback((color: string) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject() as any;
    if (!activeObj || activeObj.type !== 'textbox') return;

    activeObj.set('fill', color);
    canvas.renderAll();
    setFontColor(color);
  }, []);

  const bringForward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    canvas.bringObjectForward(activeObj);
    canvas.renderAll();
  }, []);

  const sendBackward = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    canvas.sendObjectBackwards(activeObj);
    canvas.renderAll();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={addText}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Add Text
          </button>
          <button
            onClick={addRect}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Add Rectangle
          </button>
          <button
            onClick={addCircle}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600"
          >
            Add Circle
          </button>
          <button
            onClick={addLine}
            className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Add Line
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300" />

        <button
          onClick={deleteSelected}
          disabled={selectedIds.length === 0}
          className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
        <button
          onClick={duplicateSelected}
          disabled={selectedIds.length === 0}
          className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Duplicate
        </button>

        <div className="h-8 w-px bg-gray-300" />

        <button
          onClick={bringForward}
          disabled={selectedIds.length === 0}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Bring Forward
        </button>
        <button
          onClick={sendBackward}
          disabled={selectedIds.length === 0}
          className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Send Backward
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="bg-white border-b border-gray-200 p-3 flex items-center gap-4">
          <span className="text-sm text-gray-600">Text Formatting:</span>
          
          <input
            type="number"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            min={8}
            max={72}
          />

          <input
            type="color"
            value={fontColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border border-gray-300"
          />

          <button
            onClick={() => applyTextFormat('bold')}
            className={`px-3 py-1 text-sm font-bold rounded ${isBold ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            B
          </button>
          <button
            onClick={() => applyTextFormat('italic')}
            className={`px-3 py-1 text-sm italic rounded ${isItalic ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            I
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => applyTextFormat('left')}
              className={`px-2 py-1 text-sm rounded ${textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Left
            </button>
            <button
              onClick={() => applyTextFormat('center')}
              className={`px-2 py-1 text-sm rounded ${textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Center
            </button>
            <button
              onClick={() => applyTextFormat('right')}
              className={`px-2 py-1 text-sm rounded ${textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Right
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-8 flex items-start justify-center">
        <div className="bg-white shadow-lg">
          <canvas
            ref={canvasRef}
            onDoubleClick={handleDoubleClick}
          />
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <span>Elements: {orderRef.current.length}</span>
        <span>Selected: {selectedIds.length}</span>
        <span>Double-click text to edit</span>
      </div>
    </div>
  );
};

export default FabricCanvas;
