import { apiRequest } from "./client";
import type { TemplateConfig } from "../types";

export interface CompileCVRequest {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cv_data: Record<string, any>;
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