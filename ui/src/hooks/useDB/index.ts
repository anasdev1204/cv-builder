import { useCallback, useEffect, useState } from "react";

export function useDB<T>(
    read: () => Promise<T | null>,
    write: (value: T) => Promise<void>,
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const value = await read();
            setData(value);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load local data.",
            );
        } finally {
            setLoading(false);
        }
    }, [read]);

    const save = useCallback(
        async (value: T) => {
            setSaving(true);
            setError(null);

            try {
                await write(value);
                setData(value);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Failed to save local data.",
                );
                throw error;
            } finally {
                setSaving(false);
            }
        },
        [write],
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    return {
        data,
        loading,
        saving,
        error,
        save,
        reload: load,
    };
}