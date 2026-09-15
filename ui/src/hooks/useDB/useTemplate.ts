import { useCallback } from 'react';
import { db, type StoredTemplate } from '@/db/database';
import { useDB } from '.';
import type { TemplateConfig } from '@/types';

export function useTemplate(id: string = 'default') {
  const read = useCallback(async () => {
    return await db.templates.toArray();
  }, []);

  const write = useCallback(async (templates: StoredTemplate[]) => {
    await db.templates.put(templates[0]);
  }, []);

  const { data, loading, saving, error, save, reload } = useDB<StoredTemplate[]>(read, write);

  const saveConfig = useCallback(
    async (name: string, config: TemplateConfig) => {
      await save([
        {
          id,
          name,
          config,
          updatedAt: Date.now(),
        },
      ]);
    },
    [id, save],
  );

  return {
    templates: data,
    config: data ? data[0]?.config : undefined,
    loading,
    saving,
    error,
    saveConfig,
    reload,
  };
}
