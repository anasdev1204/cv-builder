import { useCallback } from "react";
import { db } from "@/db/database";
import { useDB } from ".";
import type { StoredSettings } from "@/db/database";

export function useSettings() {
    const read = useCallback(
        () => db.settings.get("settings").then((value) => value ?? null),
        [],
    );

    const write = useCallback(
        async (value: StoredSettings) => {
            await db.settings.put(value);
        },
        [],
    );

    return useDB<StoredSettings>(read, write);
}