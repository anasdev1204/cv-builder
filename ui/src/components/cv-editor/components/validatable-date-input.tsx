import { Box, Flex, Text } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCircleCheck } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

type InputState = "idle" | "editing" | "error" | "validated";

interface ValidatableDateInputProps {
    value: string | null;
    name: string;
    onChange: (value: string | null) => void;
    placeholder: string;
    isValid?: boolean;
    isError?: boolean;
}

export default function ValidatableDateInput({
    value,
    name,
    onChange,
    placeholder,
    isValid = false,
    isError = false,
}: ValidatableDateInputProps) {
    const [state, setState] = useState<InputState>("idle");

    const hasValue = value !== null && value.trim() !== "";

    const toggleState = useCallback(
        (newState: InputState) => {
            if (newState !== "idle" || !hasValue) {
                setState(newState);
            }

            if (newState === "editing" && !hasValue) {
                setState("idle");
            }
        },
        [hasValue]
    );

    useEffect(() => {
        if (isValid) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            toggleState("validated");
        } else if (isError) {
            toggleState("error");
        } else {
            toggleState("editing");
        }
    }, [isValid, isError, toggleState]);

    const dateValue = value ? new Date(value) : null;

    return (
        <Box pos="relative">
            {state !== "validated" ? (
                <>
                    <DateInput
                        name={name}
                        value={dateValue}
                        onChange={(date) => {
                            onChange(
                                date
                                    ? date
                                    : null
                            );
                        }}
                        onFocus={() => toggleState("editing")}
                        onBlur={() => toggleState("idle")}
                        error={state === "error"}
                        valueFormat="DD/MM/YYYY"
                        clearable
                    />

                    <Text
                        pos="absolute"
                        size="sm"
                        mx="md"
                        top={8}
                        c="gray.6"
                        bg="white"
                        fw={500}
                        style={{
                            pointerEvents: "none",
                            transform:
                                state === "editing" || hasValue
                                    ? "translateY(-75%) scale(0.75)"
                                    : "translateY(0) scale(1)",
                            transformOrigin: "top left",
                            transition:
                                "transform 0.2s ease, color 0.2s ease",
                        }}
                    >
                        {placeholder}
                    </Text>
                </>
            ) : (
                <Box>
                    <Text size="sm" c="gray.9" fw={500}>
                        {placeholder}
                    </Text>

                    <Flex align="center" gap="xs" mt={4}>
                        <Text
                            size="sm"
                            c="gray.6"
                            fs="italic"
                        >
                            {value}
                        </Text>

                        {hasValue && (
                            <IconCircleCheck
                                size={12}
                                color="green"
                            />
                        )}
                    </Flex>
                </Box>
            )}
        </Box>
    );
}