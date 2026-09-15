import { useCallback } from 'react';
import { db, type StoredTemplate } from '@/db/database';
import { useDB } from '.';
import type { TemplateConfig } from '@/types';

export function useTemplate(id: string = 'default') {
  const read = useCallback(async () => {
    return (await db.templates.get(id)) || null;
  }, [id]);

  const write = useCallback(
    async (template: StoredTemplate) => {
      await db.templates.put(template);
    },
    [],
  );

  const { data, loading, saving, error, save, reload } = useDB<StoredTemplate>(read, write);

  const saveConfig = useCallback(
    async (name: string, config: TemplateConfig) => {
      await save({
        id,
        name,
        config,
        updatedAt: Date.now(),
      });
    },
    [id, save],
  );

  return {
    template: data,
    config: data?.config ?? null,
    loading,
    saving,
    error,
    saveConfig,
    reload,
  };
}