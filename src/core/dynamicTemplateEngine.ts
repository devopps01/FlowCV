import type { TemplateDefinition, TemplateId } from '@/types/resume-builder.types';
import { getTemplateById, templateRegistry } from '@/templates/templateRegistry';

export const resolveTemplate = (templateId: TemplateId): TemplateDefinition => getTemplateById(templateId);
export const listAvailableTemplates = (): TemplateId[] => Object.keys(templateRegistry) as TemplateId[];
