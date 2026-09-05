import { Box, Button, Grid, Text } from "@mantine/core";
import ValidatableInput from "./validatable-input";
import { useForm } from "@mantine/form";
import type { CVRaw } from "@/types";
import type { TFunction } from "i18next";
import { useState } from "react";


type CVFormProps = {
    t: TFunction
    cv: CVRaw;
    version: string | null;
}

export default function CVForm({ t, cv, version }: CVFormProps) {

    const [validated, setValidated] = useState(false);
    
    const form = useForm<CVRaw>({
        initialValues: {
            user_data: {
                name: cv?.user_data.name ?? "",
                email: cv?.user_data.email ?? "",
                picture: cv?.user_data.picture ?? null,
                phone_number: cv?.user_data.phone_number ?? null,
                linkedin: cv?.user_data.linkedin ?? null,
                portfolio: cv?.user_data.portfolio ?? null,
                address: {
                    country: cv?.user_data.address?.country ?? "",
                    city: cv?.user_data.address?.city ?? "",
                },
            },
            sections:
                version && cv
                    ? {
                          [version]: cv.sections[version],
                      }
                    : {},
        },

        validate: {
            user_data: {
                name: (value) =>
                    value.trim().length < 2
                        ? "Name must be at least 2 characters"
                        : null,

                email: (value) =>
                    /^\S+@\S+\.\S+$/.test(value)
                        ? null
                        : "Invalid email address",
            },
        },
    });

    const handleValidate = () => {
        form.validate();
        setValidated(true);
    };

    const updateFormValue = (field: string, value: string) => {
        form.setFieldValue(field, value);
    };

    return (
        <Box
            py="md">
            <Text
                fw={700}
                size="lg">
                    User data
            </Text>

            <Box
                p="md"
                bg="white"
                bd="1px solid gray.2"
                bdrs="md"
                mt="md">

                    <Grid gap="md">
                        <Grid.Col span={6}>
                            <ValidatableInput 
                                placeholder={t("cv.editor.nameInput.placeholder")}
                                value={form.values.user_data.name}
                                onChange={(value) => updateFormValue("user_data.name", value)}
                                isValid={validated && !form.errors["user_data.name"]}
                                isError={validated && !!form.errors["user_data.name"]}
                            />
                        </Grid.Col>

                        <Grid.Col span={6}>
                            <ValidatableInput 
                                placeholder={t("cv.editor.emailInput.placeholder")}
                                value={form.values.user_data.email}
                                onChange={(value) => updateFormValue("user_data.email", value)}
                                isValid={validated && !form.errors["user_data.email"]}
                                isError={validated && !!form.errors["user_data.email"]}
                            />
                        </Grid.Col>
                    </Grid>

                    <Button mt="md" onClick={handleValidate} mx="auto" display="block">
                        Validate
                    </Button>
            </Box>
        </Box>
    )
}