import { apiRequest } from './client';
import type { CVRaw, TemplateConfig } from '@/types';

export interface CompileCVRequest {
  cv_data: CVRaw;
  job_title: string;
  template_name: string;
  version: string;
  template_config: TemplateConfig | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excluded_data: Record<string, any>;
  output_format: string;
}

export async function compileCV(body: CompileCVRequest): Promise<Blob> {
  return apiRequest<Blob>(
    '/cv/compile',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    'blob',
  );
}
