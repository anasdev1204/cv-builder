import { NativeSelect, Paper, Flex, Text, ActionIcon } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TFunction } from "i18next";
import type { CVRaw } from "@/types";
import SectionParagraphEditor from "./section-paragraph-editor";
import SectionListEditor from "./section-list-editor";
import SectionEntriesEditor from "./section-entries-editor";

type DynamicCustomSectionProps = {
  t: TFunction;
  form: UseFormReturnType<CVRaw>;
  version: string;
  sectionKey: string;
  onRemove: () => void;
};

export default function SectionDynamic({
  t,
  form,
  version,
  sectionKey,
  onRemove,
}: DynamicCustomSectionProps) {
  const pathPrefix = `sections.${version}.other_sections.${sectionKey}`;
  const sectionData = form.values.sections[version]?.other_sections?.[sectionKey];

  const getContentType = () => {
    if (!sectionData) return "paragraph";
    if (typeof sectionData.content === "string") return "paragraph";
    if (Array.isArray(sectionData.content)) {
      if (sectionData.content.length === 0) return "string_list";
      return typeof sectionData.content[0] === "string" ? "string_list" : "entries";
    }
    return "paragraph";
  };

  const handleTypeChange = (type: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialContent: string | string[] | any[] = "";
    if (type === "string_list") initialContent = [""];
    if (type === "entries") {
      initialContent = [
        {
          title: "",
          subtitle: "",
          start_date: null,
          end_date: null,
          bullet_points: [""],
        },
      ];
    }

    form.setFieldValue(`${pathPrefix}.content`, initialContent);
  };

  const contentType = getContentType();

  return (
    <Paper p="sm" withBorder mb="md" bg="gray.0">
      <Flex justify="space-between" align="center" mb="sm">
        <Text fw={700}>{sectionKey}</Text>
        <Flex gap="sm" align="center">
          <NativeSelect
            size="xs"
            value={contentType}
            onChange={(e) => handleTypeChange(e.currentTarget.value)}
            data={[
              { label: t("cv.editor.custom.paragraph"), value: "paragraph" },
              { label: t("cv.editor.custom.stringList"), value: "string_list" },
              { label: t("cv.editor.custom.entries"), value: "entries" },
            ]}
          />
          <ActionIcon color="red" variant="subtle" onClick={onRemove}>
            <IconTrash size={16} />
          </ActionIcon>
        </Flex>
      </Flex>

      {contentType === "paragraph" && (
        <SectionParagraphEditor
          t={t}
          form={form}
          version={version}
          sectionKey={`other_sections.${sectionKey}`}
          sectionTitle={sectionKey}
          isValid={false}
          isError={false}
        />
      )}

      {contentType === "string_list" && (
        <SectionListEditor
          t={t}
          form={form}
          version={version}
          sectionKey={`other_sections.${sectionKey}`}
          sectionTitle={sectionKey}
          isValid={false}
          isError={false}
        />
      )}

      {contentType === "entries" && (
        <SectionEntriesEditor
          t={t}
          form={form}
          version={version}
          sectionKey={`other_sections.${sectionKey}`}
          sectionTitle={sectionKey}
          isValid={false}
          isError={false}
        />
      )}
    </Paper>
  );
}