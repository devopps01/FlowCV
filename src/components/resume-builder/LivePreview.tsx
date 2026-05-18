'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ResumeData } from './types';
import ResumePreview from './ResumePreview';

interface LivePreviewProps {
  data: ResumeData;
  onDataChange: (data: ResumeData) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface PreviewState {
  data: ResumeData;
  isDirty: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  saveError: string | null;
  version: number;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  data: initialData,
  onDataChange,
  autoSave = true,
  autoSaveDelay = 2000
}) => {
  const [previewState, setPreviewState] = useState<PreviewState>({
    data: initialData,
    isDirty: false,
    lastSaved: null,
    isSaving: false,
    saveError: null,
    version: 0
  });

  const [showChanges, setShowChanges] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Partial<ResumeData>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [numPages, setNumPages] = useState(1);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced auto-save functionality
  const triggerAutoSave = useCallback((updatedData: ResumeData) => {
    if (!autoSave) return;

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setPreviewState(prev => ({ ...prev, isSaving: true, saveError: null }));

      try {
        // Simulate API call to save data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setPreviewState(prev => ({
          ...prev,
          data: updatedData,
          isDirty: false,
          lastSaved: new Date(),
          isSaving: false,
          saveError: null,
          version: prev.version + 1
        }));

        onDataChange(updatedData);
      } catch (error) {
        setPreviewState(prev => ({
          ...prev,
          isSaving: false,
          saveError: error instanceof Error ? error.message : 'Save failed'
        }));
      }
    }, autoSaveDelay);
  }, [autoSave, autoSaveDelay, onDataChange]);

  // Handle data changes with live preview
  const handleDataChange = useCallback((changes: Partial<ResumeData>) => {
    const updatedData = { ...previewState.data, ...changes };
    
    setPreviewState(prev => ({
      ...prev,
      data: updatedData,
      isDirty: true
    }));

    setPendingChanges(changes);
    triggerAutoSave(updatedData);
  }, [previewState.data, triggerAutoSave]);

  // Real-time content synchronization
  const synchronizeContent = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    const changes: any = {};
    let current = changes;

    // Build nested object structure
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = current[keys[i]] || {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    handleDataChange(changes);
  }, [handleDataChange]);

  // Live preview updates
  useEffect(() => {
    if (JSON.stringify(initialData) !== JSON.stringify(previewState.data)) {
      setPreviewState(prev => ({
        ...prev,
        data: initialData,
        isDirty: true
      }));
    }
  }, [initialData]);

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Force save
  const forceSave = useCallback(async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setPreviewState(prev => ({ ...prev, isSaving: true, saveError: null }));

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPreviewState(prev => ({
        ...prev,
        data: previewState.data,
        isDirty: false,
        lastSaved: new Date(),
        isSaving: false,
        saveError: null,
        version: prev.version + 1
      }));

      onDataChange(previewState.data);
    } catch (error) {
      setPreviewState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Save failed'
      }));
    }
  }, [previewState.data, onDataChange]);

  // Revert changes
  const revertChanges = useCallback(() => {
    setPreviewState(prev => ({
      ...prev,
      data: initialData,
      isDirty: false,
      pendingChanges: {}
    }));
    setPendingChanges({});
  }, [initialData]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header with save status */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-900">Live Preview</h3>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {previewState.isSaving && (
              <div className="flex items-center gap-1 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            
            {previewState.lastSaved && !previewState.isSaving && (
              <div className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-sm">Saved</span>
              </div>
            )}
            
            {previewState.isDirty && !previewState.isSaving && (
              <div className="flex items-center gap-1 text-yellow-600">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <span className="text-sm">Unsaved</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Version info */}
          <span className="text-xs text-gray-500">v{previewState.version}</span>
          
          {/* Actions */}
          <button
            onClick={() => setShowChanges(!showChanges)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            {showChanges ? 'Hide' : 'Show'} Changes
          </button>
          
          {previewState.isDirty && (
            <>
              <button
                onClick={forceSave}
                disabled={previewState.isSaving}
                className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded transition-colors"
              >
                Save Now
              </button>
              <button
                onClick={revertChanges}
                className="px-3 py-1 text-sm bg-gray-600 text-white hover:bg-gray-700 rounded transition-colors"
              >
                Revert
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main preview area */}
        <div className="flex-1 overflow-auto bg-gray-100 py-10">
          <ResumePreview
            data={previewState.data}
            isThumbnail={false}
            isExporting={false}
            onReorderSections={() => {}}
            onSelectSection={() => {}}
            selectedSectionId={null}
            numPages={numPages}
            previewRef={previewRef}
            zoomLevel={zoomLevel}
          />
        </div>

        {/* Changes panel */}
        {showChanges && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Pending Changes</h4>
              
              {Object.keys(pendingChanges).length === 0 ? (
                <p className="text-sm text-gray-500">No pending changes</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(pendingChanges).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm text-gray-700 mb-1">
                        {key}
                      </h5>
                      <div className="text-xs text-gray-600">
                        <div className="mb-1">
                          <span className="font-medium">New:</span> {JSON.stringify(value)}
                        </div>
                        <div>
                          <span className="font-medium">Old:</span> {JSON.stringify(
                            key.split('.').reduce((obj: any, k) => obj?.[k], initialData)
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Auto-save settings */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-sm text-blue-900 mb-2">Auto-Save Settings</h5>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => {
                        // This would be handled by parent component
                        console.log('Auto-save toggled:', e.target.checked);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-blue-800">Enable auto-save</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-800">Delay:</span>
                    <select
                      value={autoSaveDelay}
                      onChange={(e) => {
                        console.log('Auto-save delay changed:', e.target.value);
                      }}
                      className="px-2 py-1 text-sm border border-blue-200 rounded bg-white"
                    >
                      <option value={1000}>1s</option>
                      <option value={2000}>2s</option>
                      <option value={5000}>5s</option>
                      <option value={10000}>10s</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Save history */}
              <div className="mt-6">
                <h5 className="font-medium text-sm text-gray-900 mb-2">Save History</h5>
                <div className="space-y-1">
                  {previewState.lastSaved && (
                    <div className="text-xs text-gray-600">
                      Last saved: {previewState.lastSaved.toLocaleTimeString()}
                    </div>
                  )}
                  <div className="text-xs text-gray-600">
                    Version: {previewState.version}
                  </div>
                  {previewState.saveError && (
                    <div className="text-xs text-red-600">
                      Error: {previewState.saveError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time sync indicator */}
      <div className="px-4 py-1 bg-gray-800 text-white">
        <div className="flex items-center justify-between text-xs">
          <span>Real-time sync active</span>
          <span>Auto-save: {autoSave ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
    </div>
  );
};

// Hook for real-time content synchronization
export const useLiveSync = (initialData: ResumeData, onSave: (data: ResumeData) => void) => {
  const [data, setData] = useState(initialData);
  const [listeners, setListeners] = useState<Map<string, Set<(value: any) => void>>>(new Map());

  // Subscribe to data changes at specific path
  const subscribe = useCallback((path: string, callback: (value: any) => void) => {
    setListeners(prev => {
      const newListeners = new Map(prev);
      if (!newListeners.has(path)) {
        newListeners.set(path, new Set());
      }
      newListeners.get(path)!.add(callback);
      return newListeners;
    });

    // Return unsubscribe function
    return () => {
      setListeners(prev => {
        const newListeners = new Map(prev);
        const pathListeners = newListeners.get(path);
        if (pathListeners) {
          pathListeners.delete(callback);
          if (pathListeners.size === 0) {
            newListeners.delete(path);
          }
        }
        return newListeners;
      });
    };
  }, []);

  // Update data at specific path
  const updateData = useCallback((path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...data };
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    const oldValue = current[keys[keys.length - 1]];
    current[keys[keys.length - 1]] = value;

    setData(newData);

    // Notify listeners
    listeners.forEach((pathListeners, listenerPath) => {
      if (path.startsWith(listenerPath) || listenerPath.startsWith(path)) {
        pathListeners.forEach(callback => callback(value));
      }
    });

    // Trigger save
    onSave(newData);
  }, [data, listeners, onSave]);

  return {
    data,
    updateData,
    subscribe
  };
};

export default LivePreview;
