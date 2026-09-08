import { useMemo } from "react";
import { Box,Text } from "@mantine/core";
import { type FormErrors } from "@mantine/form";
import type { TFunction } from "i18next";

type ErrorBoxProps = {
    path: string;
    errors: FormErrors | null;
    t: TFunction;
    children: React.ReactNode;
};

export default function FormBlockContainer ({ path, errors, t, children }: ErrorBoxProps) {
    const blockErrors = useMemo(() => {
        if (!errors) return null;

        return Object.fromEntries(Object.entries(errors).filter(([key]) => key.startsWith(path + ".")));
    }, [errors, path]);

    return (
        <Box
            p="md"
            bg="white"
            bd="1px solid gray.2"
            bdrs="md"
            mt="md"
        > 
            {
                blockErrors && Object.keys(blockErrors).length > 0 && (
                    <Box 
                        mb="md"
                        p="md"
                        bg="red.3"
                        bd="1px solid red.6"
                        bdrs="md">
                            <Text fw={700} size="md" c="red.9">
                                {t("cv.editor.form.validationErrorTitle")}
                            </Text>

                            {
                                Object.keys(blockErrors).length > 0 && (
                                    <ul style={{
                                        listStyleType: "none"
                                    }}>
                                        {Object.entries(blockErrors).map(([key, value]) => (
                                            <li key={key}>
                                                <Text c="red.9" fw={500}> 
                                                    {value}
                                                </Text>
                                            </li>
                                        ))}
                                    </ul>
                                )
                            }
                    </Box>
                )
            }
            {children}
        </Box>
    );
};