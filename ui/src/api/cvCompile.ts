import { apiRequest } from "./client";
import type { CVRaw, TemplateConfig } from "../types";

export interface CompileCVRequest {
    cv_data: CVRaw;
    job_title: string;
    template_name: string;
    template_config: TemplateConfig | null;
    output_format: string;
}

export async function compileCV(
    body: CompileCVRequest,
): Promise<Blob> {
    return apiRequest<Blob>("/cv/compile", {
        method: "POST",
        body: JSON.stringify(body),
    },
    "blob");
}