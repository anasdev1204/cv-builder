import { apiRequest } from "./client";

export interface healthResponse {
    status: string;
}

export async function health(): Promise<healthResponse> {
    return apiRequest<healthResponse>("/health", {
        method: "GET",
    });
}