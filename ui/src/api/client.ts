const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit,
    responseType: "json" | "blob" = "json",
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        let message = `Request failed with status ${response.status}`;

        try {
            const body = await response.json();

            if (body.detail) {
                message = body.detail;
            }
        } catch {
            console.error("Failed to parse error response as JSON");
        }

        throw new Error(message);
    }

    if (responseType === "blob") {
        return response.blob() as Promise<T>;
    }

    return response.json();
}