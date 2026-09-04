import { useCallback } from "react";
import { db } from "@/db/database";
import { useDB } from ".";
import type { CVRaw } from "@/types";

export function useCV() {
    const read = useCallback(
        () => db.cvs.get("current").then((value) => value?.data ?? null),
        [],
    );

    const write = useCallback(
        async (cv: CVRaw) => {
            await db.cvs.put({
                id: "current",
                data: cv,
                updatedAt: Date.now(),
            });
        },
        [],
    );

    return useDB<CVRaw>(read, write);
}