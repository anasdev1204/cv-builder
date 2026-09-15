// src/db/database.ts

import Dexie, { type Table } from 'dexie';
import type { CVEntryMatch, CVRaw, ParsedJD, TemplateConfig } from '@/types';

export interface StoredCV {
  id: string;
  data: CVRaw;
  updatedAt: number;
}

export interface StoredJobDescription {
  id: string;
  text: string;
  parsed: ParsedJD | null;
  createdAt: number;
}

export interface StoredMatchedCV {
  id: string;
  cv: CVRaw;
  jobDescription: ParsedJD;
  matches: CVEntryMatch[];
  createdAt: number;
}

export interface StoredSettings {
  id: string;
  apiKey: string;
  model: string;
}

export interface StoredTemplate {
  id: string;
  name: string;
  config: TemplateConfig;
  updatedAt: number;
}

class CVDatabase extends Dexie {
  cvs!: Table<StoredCV, string>;
  jobDescriptions!: Table<StoredJobDescription, string>;
  matchedCVs!: Table<StoredMatchedCV, string>;
  settings!: Table<StoredSettings, string>;
  templates!: Table<StoredTemplate, string>;

  constructor() {
    super('cv-builder');

    this.version(1).stores({
      cvs: 'id, updatedAt',
      matchedCVs: 'id, createdAt',
      jobDescriptions: 'id, createdAt',
      settings: 'id',
    });

    this.version(2).stores({
      templates: 'id, updatedAt',
    });
  }
}

export const db = new CVDatabase();
