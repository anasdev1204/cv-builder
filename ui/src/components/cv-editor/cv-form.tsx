import { Box, Button, Flex, Grid, NativeSelect, Text } from "@mantine/core";
import ValidatableInput from "./validatable-input";
import { useForm, type FormErrors } from "@mantine/form";
import type { CVRaw } from "@/types";
import type { TFunction } from "i18next";
import { useState } from "react";


type CVFormProps = {
    t: TFunction
    cv: CVRaw;
    version: string | null;
    setVersion: (version: string) => void;
    addCVVersion: (version: string) => void;
}

export default function CVForm({ t, cv, version, setVersion, addCVVersion }: CVFormProps) {
    const [validated, setValidated] = useState(false);
    const [editing, setEditing] = useState(true);
    const [errors, setErrors] = useState<FormErrors | null>(null);

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
                        ? t("cv.editor.nameInput.validationError")
                        : null,

                email: (value) =>
                    /^\S+@\S+\.\S+$/.test(value)
                        ? null
                        : t("cv.editor.emailInput.validationError"),

                phone_number: (value) =>
                    value && !/^\+?[0-9\s\-()]{7,20}$/.test(value)
                        ? t("cv.editor.phoneNumberInput.validationError")
                        : null,

                linkedin: (value) =>
                    value &&
                    !/^https?:\/\/(www\.)?linkedin\.com\/.+$/i.test(value)
                        ? t("cv.editor.linkedinInput.validationError")
                        : null,

                portfolio: (value) =>
                    value &&
                    !/^https?:\/\/.+$/i.test(value)
                        ? t("cv.editor.portfolioInput.validationError")
                        : null,

                address: {
                    country: (value) =>
                        value.trim().length < 2
                            ? t("cv.editor.countryInput.validationError")
                            : null,

                    city: (value) =>
                        value.trim().length < 2
                            ? t("cv.editor.cityInput.validationError")
                            : null,
                },
            },
        },
    });

    const handleValidate = () => {
        const result = form.validate();

        if (!result.hasErrors) {
            setErrors(null);
            setEditing(false);
        } else {
            setErrors(result.errors);
            setEditing(true);
        }

        setValidated(true);
    };

    const handleEdit = () => {
        setEditing(true);
        setValidated(false);
        setErrors(null);
    };

    const updateFormValue = (field: string, value: string) => {
        form.setFieldValue(field, value);

        if (validated) {
            setValidated(false);
        }
    };

    const [isAddingVersion, setIsAddingVersion] = useState(false);
    const [newVersionName, setNewVersionName] = useState("");

    const addNewVersion = () => {
        if (newVersionName.trim().length > 0) {
            addCVVersion(newVersionName.trim());
            setIsAddingVersion(false);
        }
    };

    return (
         <Box>
            <Text fw={700} size="lg" pt="md">
                {t("cv.editor.form.userDataTitle")}
            </Text>

            <Box
                p="md"
                bg="white"
                bd="1px solid gray.2"
                bdrs="md"
                mt="md"
            >   
                {
                    errors && <Box 
                        mb="md"
                        p="md"
                        bg="red.3"
                        bd="1px solid red.6"
                        bdrs="md">
                            <Text fw={700} size="md" c="red.9">
                                {t("cv.editor.form.validationErrorTitle")}
                            </Text>

                            {
                                Object.keys(errors).length > 0 && (
                                    <ul style={{
                                        listStyleType: "none"
                                    }}>
                                        {Object.entries(errors).map(([key, value]) => (
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
                }

                <Grid>
                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.nameInput.placeholder")}
                            value={form.values.user_data.name}
                            onChange={(value) =>
                                updateFormValue("user_data.name", value)
                            }
                            name={"name"}
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.name"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.name"]
                            }
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.emailInput.placeholder")}
                            value={form.values.user_data.email}
                            name={"email"}
                            onChange={(value) =>
                                updateFormValue("user_data.email", value)
                            }
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.email"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.email"]
                            }
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.phoneNumberInput.placeholder")}
                            value={form.values.user_data.phone_number ?? ""}
                            name={"phone_number"}
                            onChange={(value) =>
                                updateFormValue(
                                    "user_data.phone_number",
                                    value
                                )
                            }
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.phone_number"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.phone_number"]
                            }
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.linkedinInput.placeholder")}
                            name={"linkedin"}
                            value={form.values.user_data.linkedin ?? ""}
                            onChange={(value) =>
                                updateFormValue(
                                    "user_data.linkedin",
                                    value
                                )
                            }
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.linkedin"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.linkedin"]
                            }
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.portfolioInput.placeholder")}
                            value={form.values.user_data.portfolio ?? ""}
                            name={"portfolio"}
                            onChange={(value) =>
                                updateFormValue(
                                    "user_data.portfolio",
                                    value
                                )
                            }
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.portfolio"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.portfolio"]
                            }
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.countryInput.placeholder")}
                            name={"country"}
                            value={
                                form.values.user_data.address?.country ?? ""
                            }
                            onChange={(value) =>
                                updateFormValue(
                                    "user_data.address.country",
                                    value
                                )
                            }
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.address.country"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.address.country"]
                            }
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <ValidatableInput
                            placeholder={t("cv.editor.cityInput.placeholder")}
                            name={"city"}
                            value={form.values.user_data.address?.city ?? ""}
                            onChange={(value) =>
                                updateFormValue(
                                    "user_data.address.city",
                                    value
                                )
                            }
                            isValid={
                                !editing && validated &&
                                !form.errors["user_data.address.city"]
                            }
                            isError={
                                editing && validated &&
                                !!form.errors["user_data.address.city"]
                            }
                        />
                    </Grid.Col>
                </Grid>
                
                <Flex justify="center" mt="md" gap="md">
                    <Button
                        onClick={handleValidate}
                    >
                        {t("cv.editor.form.validateButton")}
                    </Button>
                    {
                        validated && !errors && (
                            <Button
                                variant="outline"
                                onClick={handleEdit}
                            >
                                {t("cv.editor.form.editButton")}
                            </Button>
                        )
                    }
                </Flex>
                
            </Box>
        
            <Text fw={700} size="lg" py="md">
                {t("cv.editor.form.userDataTitle")}
            </Text>
            
            <Flex pos="relative" gap="md" w="100%" align="center">
                {
                    isAddingVersion ? (
                        <Box flex={1}>
                            <ValidatableInput
                                placeholder={t("cv.editor.form.newVersionInputPlaceholder")}
                                value={newVersionName}
                                onChange={(value) => {
                                    setNewVersionName(value);
                                }}
                                name={"new_version"}
                            />
                        </Box>
                    ) : (
                        <>
                            <NativeSelect 
                                flex={1}
                                data={Object.keys(cv.sections)} 
                            />
                            <Text
                                pos="absolute"
                                size="sm"
                                top={8}
                                c="gray.6"
                                bg="white"
                                fw={500}
                                style={{
                                    pointerEvents: "none",
                                    transform: "translateY(-85%) scale(0.75)",
                                    margin: "0 0 0 4px",
                                }}
                            >
                                {t("cv.editor.form.versionDropdownLabel")}
                            </Text>
                        </>
                    )
                }
                
                {
                    isAddingVersion ? (
                        <Flex gap="sm">
                            <Button
                                onClick={addNewVersion}
                            >
                                {t("cv.editor.form.validateButton")}
                            </Button>
                            <Button
                                variant="outline"
                                color="red"
                                onClick={() => setIsAddingVersion(false)}
                            >
                                {t("cv.editor.form.addVersionCancelButton")}
                            </Button>
                        </Flex>
                    ) : (
                        <Button
                            onClick={() => setIsAddingVersion(true)}
                        >
                            {t("cv.editor.form.addVersionButton")}
                        </Button>
                    )
                }
            </Flex>
        </Box>
    );
}