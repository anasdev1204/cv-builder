import { useCallback, useState } from "react";

interface ApiRequestState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useApiRequest<T, TArgs extends unknown[]>(
    request: (...args: TArgs) => Promise<T>,
) {
    const [state, setState] = useState<ApiRequestState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: TArgs) => {
            setState({
                data: null,
                loading: true,
                error: null,
            });

            try {
                const data = await request(...args);

                setState({
                    data,
                    loading: false,
                    error: null,
                });

                return data;
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred.";

                setState({
                    data: null,
                    loading: false,
                    error: message,
                });

                throw error;
            }
        },
        [request],
    );

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}