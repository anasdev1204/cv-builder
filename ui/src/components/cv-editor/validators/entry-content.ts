import { isSectionEntry, type SectionEntry } from '@/types';
import type { TFunction } from 'i18next';

export const validateEntryContent = (value: string | SectionEntry[] | string[], t: TFunction) => {
  if (Array.isArray(value) && value.length > 0 && isSectionEntry(value[0])) {
    const se = value as SectionEntry[];
    for (const entry of se) {
      if (entry.title.trim().length < 2) return t('cv.editor.entryInput.titleValidationError');
      if (entry.subtitle.trim().length < 2)
        return t('cv.editor.entryInput.subtitleValidationError');
      if (
        entry.end_date &&
        entry.start_date &&
        new Date(entry.end_date) < new Date(entry.start_date)
      ) {
        return t('cv.editor.entryInput.datesValidationError');
      }
      if (entry.bullet_points.some((bp) => bp.trim().length < 3)) {
        return t('cv.editor.entryInput.bulletPointValidationError');
      }
    }
  }
  return null;
};
