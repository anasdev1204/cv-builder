import { apiRequest } from './client';
import type { TemplateConfig } from '@/types';

export type TemplateConfigResult = {
  templates: Record<string, TemplateConfig>;
};

export async function getTemplates(): Promise<TemplateConfigResult> {
  return apiRequest<TemplateConfigResult>('/templates', {
    method: 'GET',
  });
}
