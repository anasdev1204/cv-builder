import { apiRequest } from "./client";
import type { CVEntryMatch, ParsedJD } from "../types";

export interface CVMatchRequest {
  parsed_jd: ParsedJD
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cv_raw: Record<string, any>
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