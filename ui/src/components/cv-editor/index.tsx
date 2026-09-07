import { Box } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
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
   
    const [version, setVersion] = useState<string | null>(null);

    useEffect(() => {
        if (currentCV) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setVersion(Object.keys(currentCV.sections)[0] || null);
        }
    }, [currentCV, setVersion]);

    const initCv = useCallback(() => {
        if (!cv) {
            setCurrentCV({
                user_data: {
                    name: "name",
                    email: "name@example.com",
                    picture: null,
                    phone_number: null,
                    linkedin: null,
                    portfolio: null,
                    address: {
                        country: "france",
                        city: "grenoble",
                    }
                },
                sections: {
                    "default": {
                        summary: {
                            title: "",
                            content: ""
                        },
                        experience: {
                            title: "",
                            content: []
                        },
                        education: {
                            title: "",
                            content: []
                        },
                        skills: {
                            title: "",
                            content: []
                        },
                        languages: {
                            title: "",
                            content: []
                        },
                        other_sections: {

                        }
                    }
                },
            });

            setVersion("default");
        }
    }, [cv, setCurrentCV, setVersion]);

    const addCVVersion = useCallback((versionName: string) => {
        if (currentCV) {
            setCurrentCV({
                ...currentCV,
                sections: {
                    ...currentCV.sections,
                    [versionName]: {
                        summary: {
                            title: "",
                            content: ""
                        },
                        experience: {
                            title: "",
                            content: []
                        },
                        education: {
                            title: "",
                            content: []
                        },
                        skills: {
                            title: "",
                            content: []
                        },
                        languages: {
                            title: "",
                            content: []
                        },
                        other_sections: {

                        }
                    }
                }
            });
        }
    }, [currentCV, setCurrentCV]);

    const { t } = useTranslation();

    return (
        <Box>
            {
                currentCV ? <CVForm t={t} cv={currentCV} version={version} setVersion={setVersion} addCVVersion={addCVVersion} /> : <CreateNewCVSection t={t} initCv={initCv} />
            }
        </Box>
    )
}
