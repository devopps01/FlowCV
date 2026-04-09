'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface HistoryState<T> {
  elements: Record<string, T>;
  order: string[];
}

export function useHistory<T extends Record<string, any>>(
  initialState: HistoryState<T>
) {
  const [history, setHistory] = useState<HistoryState<T>[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    setCanUndo(historyIndex > 0);
    setCanRedo(historyIndex < history.length - 1);
  }, [historyIndex, history.length]);

  const pushState = useCallback((state: HistoryState<T>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(state)));
      
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback((): HistoryState<T> | null => {
    if (historyIndex <= 0) return null;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    return history[newIndex];
  }, [historyIndex, history]);

  const redo = useCallback((): HistoryState<T> | null => {
    if (historyIndex >= history.length - 1) return null;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    return history[newIndex];
  }, [historyIndex, history]);

  const reset = useCallback((state: HistoryState<T>) => {
    setHistory([JSON.parse(JSON.stringify(state))]);
    setHistoryIndex(0);
  }, []);

  return {
    history,
    historyIndex,
    canUndo,
    canRedo,
    pushState,
    undo,
    redo,
    reset,
  };
}

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delay: number = 2000,
  enabled: boolean = true
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevDataRef = useRef<T>(data);

  useEffect(() => {
    if (!enabled) return;

    const hasDataChanged = JSON.stringify(data) !== JSON.stringify(prevDataRef.current);
    
    if (hasDataChanged) {
      setHasChanges(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          await onSave(data);
          setLastSaved(new Date());
          setHasChanges(false);
          prevDataRef.current = data;
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }, delay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, onSave, delay, enabled]);

  const saveNow = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      setHasChanges(false);
      prevDataRef.current = data;
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [data, onSave]);

  return {
    isSaving,
    lastSaved,
    hasChanges,
    saveNow,
  };
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecuted.current;

    if (timeSinceLastExecution >= interval) {
      lastExecuted.current = now;
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval - timeSinceLastExecution);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}
