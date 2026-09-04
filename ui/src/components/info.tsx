import { Box, Button, Collapse, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
    IconChevronDown,
} from "@tabler/icons-react";
import { useMemo } from "react";

interface InfoProps {
    collapseButtonLabels: [string, string];
    content: string;
    type: "error" | "warning" | "fyi";
    defaultExpanded?: boolean;
    collapsible?: boolean;
}

export default function Info({
    collapseButtonLabels,
    content,
    type,
    collapsible = true,
    defaultExpanded = false,
}: InfoProps) {
    const [expanded, { toggle }] = useDisclosure(defaultExpanded);

    const color = useMemo(() => {
        switch (type) {
            case "error":
                return "red";
            case "warning":
                return "yellow";
            case "fyi":
                return "blue";
        }
    }, [type]);

    return (
        <Box
            mx="auto"
            bd={expanded ? `1px solid ${color}.6` : undefined}
            bdrs="md"
        >
            <Button
                onClick={toggle}
                fullWidth
                variant={expanded ? "transparent" : "outline"}
                rightSection={
                    <IconChevronDown
                        size={18}
                        style={{
                            transform: expanded ? "rotate(180deg)" : undefined,
                            transition: "transform 150ms ease",
                        }}
                    />
                }
                styles={{
                    inner: {
                        justifyContent: "space-between",
                    },
                }}
                color={color}
            >
                {expanded
                    ? collapseButtonLabels[1]
                    : collapseButtonLabels[0]}
            </Button>

            <Collapse 
                expanded={collapsible ? expanded : true}
            >
                <Text px="lg" py="md" size="sm">
                    {content}
                </Text>
            </Collapse>
        </Box>
    );
}