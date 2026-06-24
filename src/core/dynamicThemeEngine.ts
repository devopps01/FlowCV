import type { ThemeDefinition, ThemeId } from '@/types/resume-builder.types';
import { getThemeById, themeRegistry } from '@/themes/themeRegistry';

export const resolveTheme = (themeId: ThemeId): ThemeDefinition => getThemeById(themeId);
export const listAvailableThemes = (): ThemeId[] => Object.keys(themeRegistry) as ThemeId[];
