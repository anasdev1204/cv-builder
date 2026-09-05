import { Box } from "@mantine/core";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CreateNewCVSection from "@/components/cv-editor/create-new-cv";
import CVForm from "./cv-form";

import type { CVRaw } from "@/types";

interface CVEditorProps {
    cv: CVRaw | null;
    onSave: () => void;
}

export default function CVEditor({ cv, onSave }: CVEditorProps) {
    const [currentCV, setCurrentCV] = useState<CVRaw | null>(cv);
   
    const selectedVersion = useMemo(() => {
        if (!cv) {
            return null;
        }
        return Object.keys(cv.sections)[0];
    }, [cv]);


    const initCv = useCallback(() => {
        if (!cv) {
            setCurrentCV({
                user_data: {
                    name: "",
                    email: "",
                    picture: null,
                    phone_number: null,
                    linkedin: null,
                    portfolio: null,
                    address: {
                        country: "",
                        city: "",
                    }
                },
                sections: {},
            });
        }
    }, [cv]);

    const { t } = useTranslation();

    return (
        <Box>
            {
                currentCV ? <CVForm t={t} cv={currentCV} version={selectedVersion} /> : <CreateNewCVSection t={t} initCv={initCv} />
            }
        </Box>
    )
}
