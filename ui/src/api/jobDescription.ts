import { apiRequest } from "./client";
import type { ParsedJD } from "@/types";

export interface ParseJDRequest {
    openai_api_key: string;
    job_description: string;
    model: string;
}

export interface ParseJDResponse {
    result: ParsedJD;
    input_tokens: number;
    output_tokens: number;
}

export async function parseJobDescription(
    body: ParseJDRequest,
): Promise<ParseJDResponse> {
    return apiRequest<ParseJDResponse>("/job-description/parse", {
        method: "POST",
        body: JSON.stringify(body),
    });
}