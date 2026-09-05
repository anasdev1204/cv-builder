import { Box, Text, TextInput, } from "@mantine/core";
import { use, useCallback, useEffect, useRef, useState } from "react";

type InputState = "idle" | "editing" | "error" | "validated";

interface ValidatableInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    isValid?: boolean;
    isError?: boolean;
}

export default function ValidatableInput({
    value,
    onChange,
    placeholder,
    isValid = false,
    isError = false,
}: ValidatableInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [state, setState] = useState<InputState>("idle");

    const toggleState = useCallback((newState: InputState) => {
        if (inputRef.current) {
            const hasValue = inputRef.current.value.trim() !== "";
            if (newState !== "idle" || !hasValue) {
                setState(newState);
            }
        };
    }, [inputRef, setState]);

    useEffect(() => {
        if (isValid) {
            toggleState("validated");
        } else if (isError) {
            toggleState("error");
        }
    }, [isValid, isError, toggleState]);

    return (
        <Box pos="relative">
            <TextInput
                ref={inputRef}
                value={value}
                onChange={(event) => onChange(event.currentTarget.value)}
                onFocus={() => toggleState("editing")}
                onBlur={() => toggleState("idle")}
                error={state === "error"}
            />

            <Text
                pos="absolute"
                size="sm"
                mx="md"
                top={8}
                c="gray.6"
                bg="white"
                style={{
                    pointerEvents: "none",
                    transform: state === "editing" || value ? "translateY(-75%) scale(0.75)" : "translateY(0) scale(1)",
                    transformOrigin: "top left",
                    transition: "transform 0.2s ease, color 0.2s ease",
                }}
            >
                {placeholder}
            </Text>
        </Box>
    );
}