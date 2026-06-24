'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapsiblePanelProps {
  children: React.ReactNode;
  collapsed: boolean;
  onToggle: () => void;
  /** Full expanded width in px (default: 380) */
  expandedWidth?: number;
  /** Collapsed width in px (default: 48) */
  collapsedWidth?: number;
  /** Animation duration in ms (default: 300) */
  duration?: number;
  /** Optional header content to show when expanded */
  header?: React.ReactNode;
  /** Side: 'left' or 'right' (default: 'left') - controls chevron direction */
  side?: 'left' | 'right';
  /** Additional class names */
  className?: string;
}

export const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({
  children,
  collapsed,
  onToggle,
  expandedWidth = 380,
  collapsedWidth = 48,
  duration = 300,
  header,
  side = 'left',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentWidth, setCurrentWidth] = useState(collapsed ? collapsedWidth : expandedWidth);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    setCurrentWidth(collapsed ? collapsedWidth : expandedWidth);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration + 50);
    return () => clearTimeout(timer);
  }, [collapsed, expandedWidth, collapsedWidth, duration]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col relative shrink-0 h-full ${className}`}
      style={{
        width: `${currentWidth}px`,
        minWidth: `${currentWidth}px`,
        transition: `width ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        // Use overflow:hidden ONLY when collapsed to prevent content from showing.
        // When expanded, NO overflow constraint — this lets absolutely-positioned
        // dropdowns (e.g. <select> option popups, color pickers) render outside
        // the panel without being clipped. ContentEditor handles its own scrolling
        // internally via overflow-y:auto.
        overflow: collapsed ? 'hidden' : 'visible',
      }}
    >
      {/* Header / Toggle area */}
      {header ? (
        <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
          <div
            style={{
              opacity: collapsed ? 0 : 1,
              transition: `opacity ${duration * 0.6}ms ease ${collapsed ? '0ms' : `${duration * 0.3}ms`}`,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
            className="flex-1"
          >
            {header}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 shrink-0 transition-colors"
            style={{ color: 'var(--app-text-secondary)' }}
          >
            {side === 'left' ? (
              collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            ) : (
              collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      ) : (
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            height: '44px',
            borderBottom: collapsed ? 'none' : '1px solid var(--app-border)',
          }}
        >
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title={collapsed ? 'Expand panel' : 'Collapse panel'}
            style={{ color: 'var(--app-text-secondary)' }}
          >
            {side === 'left' ? (
              collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
            ) : (
              collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Content overlay — fades in/out. Must be flex-col so children with
          flex-1 get constrained heights for scrolling. NO overflow here —
          ContentEditor/DesignEditor handle their own scrolling. */}
      <div
        className="flex flex-col"
        style={{
          flex: 1,
          minHeight: 0,
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'auto',
          transition: `opacity ${duration * 0.5}ms ease`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsiblePanel;