'use client';

import React from 'react';

type ThemeJson = {
  theme?: {
    colors?: {
      primary?: string;
      primaryHover?: string;
      secondary?: string;
      secondaryHover?: string;
      accent?: string;
      background?: { light?: string; gray?: string; medium?: string };
      text?: { primary?: string; secondary?: string; muted?: string };
      border?: { default?: string; light?: string };
      success?: string;
      error?: string;
      warning?: string;
    };
  };
};

const setVar = (k: string, v?: string) => {
  if (!v) return;
  document.documentElement.style.setProperty(k, v);
};

const hexToRgb = (hex: string) => {
  const h = hex.replace('#', '').trim();
  const normalized = h.length === 3 ? h.split('').map(ch => ch + ch).join('') : h;
  const n = parseInt(normalized, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rn: h = ((gn - bn) / d) % 6; break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const setPrimaryPaletteFromHex = (hex?: string) => {
  if (!hex) return;
  const { h, s } = rgbToHsl(hexToRgb(hex));
  const stops: Record<string, number> = {
    '50': 97, '100': 91, '200': 87, '300': 78, '400': 68,
    '500': 60, '600': 53, '700': 48, '800': 40, '900': 33,
  };
  Object.entries(stops).forEach(([k, l]) => {
    setVar(`--primary-${k}`, `${h} ${s}% ${l}%`);
  });
  setVar('--primary', `${h} ${s}% ${stops['600']}%`);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/theme', { cache: 'no-store' });
        const json = (await res.json()) as any;
        if (!res.ok || !json?.ok) return;
        const theme = (json.theme || {}) as ThemeJson;
        const c = theme.theme?.colors;
        if (!c || cancelled) return;

        setVar('--app-primary', c.primary);
        setVar('--app-primary-hover', c.primaryHover);
        setVar('--app-secondary', c.secondary);
        setVar('--app-secondary-hover', c.secondaryHover);
        setVar('--app-accent', c.accent);
        setVar('--app-bg', c.background?.light);
        setVar('--app-bg-gray', c.background?.gray);
        setVar('--app-text', c.text?.primary);
        setVar('--app-text-muted', c.text?.secondary);
        setVar('--app-border', c.border?.default);
        setVar('--app-success', c.success);
        setVar('--app-error', c.error);
        setVar('--app-warning', c.warning);

        // Tailwind primary-* now follows theme.json primary
        setPrimaryPaletteFromHex(c.primary);
      } catch {
        // Ignore theme load failures; fall back to defaults in CSS.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
