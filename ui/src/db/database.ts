// src/db/database.ts

import Dexie, { type Table } from "dexie";
import type { CVEntryMatch, CVRaw, ParsedJD } from "@/types";

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

class CVDatabase extends Dexie {
    cvs!: Table<StoredCV, string>;
    jobDescriptions!: Table<StoredJobDescription, string>;
    matchedCVs!: Table<StoredMatchedCV, string>;
    settings!: Table<StoredSettings, string>;

    constructor() {
        super("cv-builder");

        this.version(1).stores({
            cvs: "id, updatedAt",
            matchedCVs: "id, createdAt",
            jobDescriptions: "id, createdAt",
            settings: "id",
        });
    }
}

export const db = new CVDatabase();