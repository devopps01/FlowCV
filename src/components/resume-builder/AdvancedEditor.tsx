'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  MousePointer, 
  Move, 
  Square, 
  Type, 
  Image, 
  Layers, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff,
  Copy,
  Trash2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Group,
  Ungroup,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid3x3,
  Palette,
  Type as TypeIcon,
  Download,
  Upload,
  Save,
  Undo,
  Redo,
  Scissors,
  Clipboard
} from 'lucide-react';

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'container';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  rotation?: number;
  locked?: boolean;
  visible?: boolean;
  zIndex?: number;
  group?: string;
}

interface EditorState {
  elements: CanvasElement[];
  selectedElements: string[];
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  snapToGrid: boolean;
  history: CanvasElement[][];
  historyIndex: number;
  clipboard: CanvasElement[];
}

const AdvancedEditor: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    elements: [],
    selectedElements: [],
    zoom: 1,
    gridSize: 20,
    showGrid: true,
    snapToGrid: true,
    history: [],
    historyIndex: -1,
    clipboard: []
  });

  const [activeTool, setActiveTool] = useState<string>('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  // Snap to grid functionality
  const snapToGridPosition = useCallback((x: number, y: number) => {
    if (!editorState.snapToGrid) return { x, y };
    const gridSize = editorState.gridSize;
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [editorState.snapToGrid, editorState.gridSize]);

  // Add element to canvas
  const addElement = useCallback((type: CanvasElement['type'], x: number, y: number) => {
    const snappedPos = snapToGridPosition(x, y);
    const newElement: CanvasElement = {
      id: `element-${Date.now()}`,
      type,
      x: snappedPos.x,
      y: snappedPos.y,
      width: type === 'text' ? 200 : 100,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'New Text' : undefined,
      fontSize: type === 'text' ? 16 : undefined,
      fontFamily: type === 'text' ? 'Inter' : undefined,
      color: '#000000',
      backgroundColor: type === 'shape' ? '#ffffff' : 'transparent',
      borderColor: '#000000',
      borderWidth: 1,
      borderRadius: 0,
      opacity: 1,
      rotation: 0,
      locked: false,
      visible: true,
      zIndex: editorState.elements.length
    };

    setEditorState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElements: [newElement.id]
    }));
  }, [editorState.elements.length, snapToGridPosition]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'select') return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / editorState.zoom;
    const y = (e.clientY - rect.top) / editorState.zoom;

    if (activeTool === 'text' || activeTool === 'shape' || activeTool === 'container') {
      addElement(activeTool as CanvasElement['type'], x, y);
    }
  }, [activeTool, editorState.zoom, addElement]);

  // Handle element selection
  const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    
    if (activeTool === 'select') {
      setEditorState(prev => ({
        ...prev,
        selectedElements: e.shiftKey 
          ? prev.selectedElements.includes(elementId)
            ? prev.selectedElements.filter(id => id !== elementId)
            : [...prev.selectedElements, elementId]
          : [elementId]
      }));
    }
  }, [activeTool]);

  // Handle element dragging
  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activeTool !== 'select') return;
    
    const element = editorState.elements.find(el => el.id === elementId);
    if (!element || element.locked) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [activeTool, editorState.elements]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const deltaX = (e.clientX - dragStart.x) / editorState.zoom;
    const deltaY = (e.clientY - dragStart.y) / editorState.zoom;

    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(element => {
        if (!prev.selectedElements.includes(element.id) || element.locked) return element;
        
        const newX = element.x + deltaX;
        const newY = element.y + deltaY;
        const snappedPos = snapToGridPosition(newX, newY);
        
        return {
          ...element,
          x: snappedPos.x,
          y: snappedPos.y
        };
      })
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, editorState.zoom, snapToGridPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Element property updates
  const updateElementProperty = useCallback((elementId: string, property: keyof CanvasElement, value: any) => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.map(element =>
        element.id === elementId ? { ...element, [property]: value } : element
      )
    }));
  }, []);

  // Delete selected elements
  const deleteSelectedElements = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      elements: prev.elements.filter(element => !prev.selectedElements.includes(element.id)),
      selectedElements: []
    }));
  }, []);

  // Copy/Paste functionality
  const copySelectedElements = useCallback(() => {
    const selectedElementsData = editorState.elements.filter(el => 
      editorState.selectedElements.includes(el.id)
    );
    setEditorState(prev => ({
      ...prev,
      clipboard: selectedElementsData.map(el => ({ ...el, id: `element-${Date.now()}-${Math.random()}` }))
    }));
  }, [editorState.elements, editorState.selectedElements]);

  const pasteElements = useCallback(() => {
    const pastedElements = editorState.clipboard.map(el => ({
      ...el,
      id: `element-${Date.now()}-${Math.random()}`,
      x: el.x + 20,
      y: el.y + 20,
      zIndex: editorState.elements.length
    }));

    setEditorState(prev => ({
      ...prev,
      elements: [...prev.elements, ...pastedElements],
      selectedElements: pastedElements.map(el => el.id)
    }));
  }, [editorState.clipboard, editorState.elements.length]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 5)
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.1)
    }));
  }, []);

  const handleZoomReset = useCallback(() => {
    setEditorState(prev => ({
      ...prev,
      zoom: 1
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            e.preventDefault();
            copySelectedElements();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 'z':
            e.preventDefault();
            // Undo functionality
            break;
          case 'y':
            e.preventDefault();
            // Redo functionality
            break;
          case 'a':
            e.preventDefault();
            setEditorState(prev => ({
              ...prev,
              selectedElements: prev.elements.map(el => el.id)
            }));
            break;
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedElements, pasteElements, deleteSelectedElements]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* File Operations */}
          <button className="p-2 hover:bg-gray-100 rounded" title="New">
            <Square className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Open">
            <Upload className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Save">
            <Save className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Export">
            <Download className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Edit Operations */}
          <button className="p-2 hover:bg-gray-100 rounded" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Redo">
            <Redo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Paste">
            <Clipboard className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Tools */}
          <button 
            className={`p-2 rounded ${activeTool === 'select' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Select"
            onClick={() => setActiveTool('select')}
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded ${activeTool === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Text"
            onClick={() => setActiveTool('text')}
          >
            <Type className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded ${activeTool === 'shape' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Shape"
            onClick={() => setActiveTool('shape')}
          >
            <Square className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded ${activeTool === 'image' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Image"
            onClick={() => setActiveTool('image')}
          >
            <Image className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Controls */}
          <button 
            className={`p-2 rounded ${editorState.showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Toggle Grid"
            onClick={() => setEditorState(prev => ({ ...prev, showGrid: !prev.showGrid }))}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button 
            className={`p-2 rounded ${editorState.snapToGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Snap to Grid"
            onClick={() => setEditorState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }))}
          >
            <Layers className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          {/* Zoom Controls */}
          <button className="p-2 hover:bg-gray-100 rounded" title="Zoom Out" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-sm font-medium">{Math.round(editorState.zoom * 100)}%</span>
          <button className="p-2 hover:bg-gray-100 rounded" title="Zoom In" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded" title="Fit to Screen" onClick={handleZoomReset}>
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Properties Panel */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
            
            {editorState.selectedElements.length > 0 && (
              <div className="space-y-4">
                {editorState.selectedElements.map(elementId => {
                  const element = editorState.elements.find(el => el.id === elementId);
                  if (!element) return null;
                  
                  return (
                    <div key={elementId} className="p-3 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        {element.type} - {elementId.slice(-8)}
                      </h4>
                      
                      {/* Position */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-gray-500">X</label>
                          <input
                            type="number"
                            value={Math.round(element.x)}
                            onChange={(e) => updateElementProperty(elementId, 'x', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Y</label>
                          <input
                            type="number"
                            value={Math.round(element.y)}
                            onChange={(e) => updateElementProperty(elementId, 'y', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      
                      {/* Size */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="text-xs text-gray-500">Width</label>
                          <input
                            type="number"
                            value={Math.round(element.width)}
                            onChange={(e) => updateElementProperty(elementId, 'width', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Height</label>
                          <input
                            type="number"
                            value={Math.round(element.height)}
                            onChange={(e) => updateElementProperty(elementId, 'height', Number(e.target.value))}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      
                      {/* Text-specific properties */}
                      {element.type === 'text' && (
                        <>
                          <div className="mb-2">
                            <label className="text-xs text-gray-500">Text</label>
                            <input
                              type="text"
                              value={element.content || ''}
                              onChange={(e) => updateElementProperty(elementId, 'content', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="text-xs text-gray-500">Font Size</label>
                            <input
                              type="number"
                              value={element.fontSize || 16}
                              onChange={(e) => updateElementProperty(elementId, 'fontSize', Number(e.target.value))}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                            />
                          </div>
                        </>
                      )}
                      
                      {/* Color */}
                      <div className="mb-2">
                        <label className="text-xs text-gray-500">Color</label>
                        <input
                          type="color"
                          value={element.color || '#000000'}
                          onChange={(e) => updateElementProperty(elementId, 'color', e.target.value)}
                          className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      
                      {/* Lock/Unlock */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Locked</span>
                        <button
                          onClick={() => updateElementProperty(elementId, 'locked', !element.locked)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {element.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {editorState.selectedElements.length === 0 && (
              <p className="text-sm text-gray-500">Select an element to edit properties</p>
            )}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-100 overflow-hidden relative">
          <div
            ref={canvasRef}
            className="absolute inset-0 bg-white shadow-lg cursor-crosshair"
            style={{
              transform: `scale(${editorState.zoom})`,
              transformOrigin: 'top left'
            }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid */}
            {editorState.showGrid && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                  `,
                  backgroundSize: `${editorState.gridSize}px ${editorState.gridSize}px`
                }}
              />
            )}
            
            {/* Elements */}
            {editorState.elements.map(element => (
              <div
                key={element.id}
                className={`absolute border-2 cursor-move ${
                  editorState.selectedElements.includes(element.id) 
                    ? 'border-blue-500' 
                    : 'border-transparent hover:border-gray-400'
                } ${element.locked ? 'cursor-not-allowed' : ''}`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  backgroundColor: element.backgroundColor,
                  borderColor: element.borderColor,
                  borderWidth: element.borderWidth,
                  borderRadius: element.borderRadius,
                  opacity: element.opacity,
                  transform: `rotate(${element.rotation}deg)`,
                  zIndex: element.zIndex,
                  display: element.visible ? 'block' : 'none'
                }}
                onClick={(e) => handleElementClick(e, element.id)}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
              >
                {element.type === 'text' && (
                  <div
                    style={{
                      fontSize: element.fontSize,
                      fontFamily: element.fontFamily,
                      color: element.color,
                      padding: '4px'
                    }}
                  >
                    {element.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Layers */}
        <div className="w-48 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Layers</h3>
            <div className="space-y-2">
              {editorState.elements
                .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))
                .map(element => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer ${
                      editorState.selectedElements.includes(element.id) 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleElementClick({ stopPropagation: () => {} } as any, element.id)}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateElementProperty(element.id, 'visible', !element.visible);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        {element.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <span className="text-sm">{element.type}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElementProperty(element.id, 'locked', !element.locked);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      {element.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditor;
