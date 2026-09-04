import { useCallback } from "react";
import { db, type StoredJobDescription } from "@/db/database";
import { useDB } from ".";

export function useJD(id: string, all: boolean) {
    const read = useCallback(
        () => {
            if (all) {
                return db.jobDescriptions.toArray();
            }

            return db.jobDescriptions
                .get(id)
                .then((value) => (value ? [value] : []));
        },
        [id, all],
    );

    const write = useCallback(
        async (values: StoredJobDescription[]) => {
            await db.jobDescriptions.bulkPut(values);
        },
        [],
    );

    return useDB<StoredJobDescription[]>(read, write);
}