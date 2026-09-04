import { apiRequest } from "./client";
import type { CVEntryMatch, CVRaw, ParsedJD } from "../types";

export interface CVMatchRequest {
  parsed_jd: ParsedJD
  cv_raw: CVRaw
  openai_api_key: string
  selected_version: string
  chosen_model: string
};

export type CVMatchResult = {
  entry_matches: CVEntryMatch[];
}



export async function matchCV(
    body: CVMatchRequest,
): Promise<CVMatchResult> {
    return apiRequest<CVMatchResult>("/cv/match", {
        method: "POST",
        body: JSON.stringify(body),
    });
};