import { useCallback, useEffect, useState } from "react";
import { db, type StoredMatchedCV } from "@/db/database";

// Does not use useDB because we need to manage the state of the matched CVs list and provide a way to reload it after adding or removing items.
export function useMatchedCV() {
    const [data, setData] = useState<StoredMatchedCV[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const matches = await db.matchedCVs
                .orderBy("createdAt")
                .reverse()
                .toArray();

            setData(matches);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to load matched CVs.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const save = useCallback(async (value: StoredMatchedCV) => {
        setSaving(true);
        setError(null);

        try {
            await db.matchedCVs.put(value);
            setData((current) => [value, ...current]);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to save matched CV.",
            );
            throw error;
        } finally {
            setSaving(false);
        }
    }, []);

    const remove = useCallback(async (id: string) => {
        setError(null);

        try {
            await db.matchedCVs.delete(id);
            setData((current) => current.filter((item) => item.id !== id));
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete matched CV.",
            );
            throw error;
        }
    }, []);

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
        remove,
        reload: load,
    };
}