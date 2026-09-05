import CVEditor from "@/components/cv-editor/index";
import Info from "@/components/info";
import { useCV } from "@/hooks/useDB/useCV";
import { Box, LoadingOverlay } from "@mantine/core";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
    

export default function CVView() {
    const {
        data,
        loading,
        saving,
        error,
        save,
        reload
    } = useCV();
    const { t } = useTranslation();

    const onSave = useCallback(() => {
        if (data) {
            save(data);
        }

        reload()
    }, [data, save, reload]);

    return (
        <>
            <Info 
                collapseButtonLabels={[t("cv.info.expand"), t("cv.info.expand")]}
                content={t("cv.info.content")}
                type="fyi"
                collapsible={true}
                defaultExpanded={false}
            />

            <Box pos="relative">
                <LoadingOverlay visible={loading || saving} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />

                {!error && <CVEditor cv={data} onSave={onSave} />}
            </Box>
        </>
    )
}