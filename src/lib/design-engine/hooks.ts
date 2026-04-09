'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DesignEngine,
  createDesignEngine,
  generateResumeDesign,
  optimizeResumeContent,
  scoreResumeDesign,
} from '@/lib/design-engine';
import type {
  ResumeContent,
  DesignConfig,
  DesignScore,
  DesignSuggestion,
  TemplateRecommendation,
  AutoLayoutPosition,
} from '@/lib/design-engine/types';

interface UseDesignEngineReturn {
  design: DesignConfig | null;
  score: DesignScore | null;
  suggestions: DesignSuggestion[];
  recommendations: TemplateRecommendation[];
  positions: AutoLayoutPosition[];
  isGenerating: boolean;
  generateDesign: (content: ResumeContent) => void;
  optimizeContent: (content: ResumeContent) => ResumeContent;
  scoreDesign: (design: DesignConfig, content: ResumeContent) => DesignScore;
  applyTemplate: (templateId: string) => void;
  autoFix: () => void;
}

export function useDesignEngine(): UseDesignEngineReturn {
  const [design, setDesign] = useState<DesignConfig | null>(null);
  const [score, setScore] = useState<DesignScore | null>(null);
  const [suggestions, setSuggestions] = useState<DesignSuggestion[]>([]);
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [positions, setPositions] = useState<AutoLayoutPosition[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDesign = useCallback((content: ResumeContent) => {
    setIsGenerating(true);
    
    try {
      const engine = createDesignEngine(content);
      const result = engine.generateCompleteOutput();
      
      setDesign(result.design);
      setScore(result.score);
      setSuggestions(result.suggestions);
      setRecommendations([result.recommendations]);
      setPositions(result.positions);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const optimizeContentFn = useCallback((content: ResumeContent): ResumeContent => {
    return optimizeResumeContent(content);
  }, []);

  const scoreDesignFn = useCallback((design: DesignConfig, content: ResumeContent): DesignScore => {
    return scoreResumeDesign(design, content);
  }, []);

  const applyTemplate = useCallback((templateId: string) => {
    if (!design) return;

    const layoutTypes: Record<string, 'single' | 'two-column' | 'sidebar' | 'modern'> = {
      classic: 'single',
      modern: 'modern',
      minimal: 'single',
      sidebar: 'sidebar',
    };

    setDesign({
      ...design,
      layout: {
        ...design.layout,
        type: layoutTypes[templateId] || 'single',
      },
    });
  }, [design]);

  const autoFix = useCallback(() => {
    if (!design) return;

    const engine = createDesignEngine({});
    const fixedDesign = engine.autoFixDesign(design);
    setDesign(fixedDesign);
  }, [design]);

  return {
    design,
    score,
    suggestions,
    recommendations,
    positions,
    isGenerating,
    generateDesign,
    optimizeContent: optimizeContentFn,
    scoreDesign: scoreDesignFn,
    applyTemplate,
    autoFix,
  };
}

interface UseSmartLayoutReturn {
  positions: AutoLayoutPosition[];
  optimize: (content: ResumeContent, layoutType?: string) => void;
  fixOverlaps: (positions: AutoLayoutPosition[]) => AutoLayoutPosition[];
  autoArrange: (positions: AutoLayoutPosition[]) => AutoLayoutPosition[];
}

export function useSmartLayout(): UseSmartLayoutReturn {
  const [positions, setPositions] = useState<AutoLayoutPosition[]>([]);

  const optimize = useCallback((content: ResumeContent, layoutType?: string) => {
    const engine = createDesignEngine(content);
    const layout = engine.generateLayout();
    
    if (layoutType) {
      layout.type = layoutType as any;
    }
    
    const newPositions = engine.generateLayoutPositions(layout);
    setPositions(newPositions);
  }, []);

  const fixOverlaps = useCallback((positions: AutoLayoutPosition[]): AutoLayoutPosition[] => {
    const GRID_SIZE = 8;
    const fixed = [...positions].sort((a, b) => a.y - b.y);
    
    for (let i = 1; i < fixed.length; i++) {
      const prev = fixed[i - 1];
      const curr = fixed[i];
      
      const prevBottom = prev.y + prev.height;
      
      if (curr.y < prevBottom) {
        curr.y = Math.round((prevBottom + GRID_SIZE) / GRID_SIZE) * GRID_SIZE;
      }
    }
    
    return fixed;
  }, []);

  const autoArrange = useCallback((positions: AutoLayoutPosition[]): AutoLayoutPosition[] => {
    const GRID_SIZE = 8;
    let currentY = 40;
    
    const arranged = positions.map((pos) => {
      const newPos = {
        ...pos,
        y: Math.round(currentY / GRID_SIZE) * GRID_SIZE,
      };
      currentY += pos.height + GRID_SIZE * 3;
      return newPos;
    });
    
    return arranged;
  }, []);

  return {
    positions,
    optimize,
    fixOverlaps,
    autoArrange,
  };
}

interface UseColorPaletteReturn {
  palette: string[];
  currentColor: string;
  generatePalette: (role?: string) => void;
  setColor: (color: string) => void;
}

export function useColorPalette(): UseColorPaletteReturn {
  const [currentColor, setCurrentColor] = useState('#2563eb');

  const palette = useMemo(() => [
    '#2563eb',
    '#7c3aed',
    '#0f766e',
    '#dc2626',
    '#18181b',
    '#0891b2',
    '#65a30d',
    '#ea580c',
  ], []);

  const generatePalette = useCallback((role?: string) => {
    const engine = createDesignEngine({ role });
    const design = engine.generateCompleteDesign();
    setCurrentColor(design.colors.primary);
  }, []);

  const setColor = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  return {
    palette,
    currentColor,
    generatePalette,
    setColor,
  };
}
