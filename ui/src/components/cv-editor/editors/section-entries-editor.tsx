import { Box, Button, ActionIcon, Flex, Grid, Stack, Text, Paper } from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TFunction } from "i18next";
import type { CVRaw, SectionEntry } from "@/types";
import ValidatableInput from "@/components/cv-editor/components/validatable-input";
import ValidatableDateInput from "@/components/cv-editor/components/validatable-date-input";
import FormBlockContainer from "@/components/cv-editor/components/form-block-container";

type SectionEntriesEditorProps = {
  t: TFunction;
  form: UseFormReturnType<CVRaw>;
  version: string;
  sectionKey: string;
  sectionTitle: string;
  isValid: boolean;
  isError: boolean;
};

export default function SectionEntriesEditor({
  t,
  form,
  version,
  sectionKey,
  sectionTitle,
  isValid,
  isError
}: SectionEntriesEditorProps) {
  const pathPrefix = `sections.${version}.${sectionKey}`;
  const entries = sectionKey.includes("other_sections") ? (form.values.sections[version]?.["other_sections"]?.[sectionKey.split(".")[1] as string]?.content as SectionEntry[]) : (form.values.sections[version]?.[sectionKey as keyof typeof form.values.sections[typeof version]]?.content as SectionEntry[]) || [];

  const handleAddEntry = () => {
    form.insertListItem(`${pathPrefix}.content`, {
      title: "",
      subtitle: "",
      start_date: null,
      end_date: null,
      bullet_points: [""],
    });
  };

  const handleRemoveEntry = (index: number) => {
    form.removeListItem(`${pathPrefix}.content`, index);
  };

  const handleAddBullet = (entryIndex: number) => {
    form.insertListItem(`${pathPrefix}.content.${entryIndex}.bullet_points`, "");
  };

  const handleRemoveBullet = (entryIndex: number, bulletIndex: number) => {
    form.removeListItem(`${pathPrefix}.content.${entryIndex}.bullet_points`, bulletIndex);
  };

  return (
    <FormBlockContainer
      path={pathPrefix}
      errors={form.errors}
      t={t}
    >
      <Paper p="md" withBorder mb="md">
        <Text fw={600} mb="xs">{sectionTitle}</Text>
        <ValidatableInput
          placeholder={t("cv.editor.entryInput.sectionTitlePlaceholder")}
          value={sectionKey.includes("other_sections") ? (form.values.sections[version]?.["other_sections"]?.[sectionKey.split(".")[1] as string]?.title as string) : (form.values.sections[version]?.[sectionKey as keyof typeof form.values.sections[typeof version]]?.title as string)}
          name={`${sectionKey}_title`}
          onChange={(val) => form.setFieldValue(`${pathPrefix}.title`, val)}
          isValid={isValid}
          isError={isError}
        />

        <Stack gap="md" mt="md">
          {entries.map((entry, entryIndex) => (
            <Paper key={entryIndex} p="sm" withBorder bg="gray.0">
              <Flex justify="space-between" align="center" mb="xs">
                <Text size="sm" fw={600}>
                  {t("cv.editor.entryInput.entryHeader")}
                </Text>
                <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveEntry(entryIndex)}>
                  <IconTrash size={16} />
                </ActionIcon>
              </Flex>

              <Grid gap="sm">
                <Grid.Col span={6}>
                  <ValidatableInput
                    placeholder={t("cv.editor.entryInput.titlePlaceholder")}
                    value={entry.title}
                    name={`${sectionKey}_${entryIndex}_title`}
                    onChange={(val) => form.setFieldValue(`${pathPrefix}.content.${entryIndex}.title`, val)}
                    isValid={isValid}
                    isError={isError}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <ValidatableInput
                    placeholder={t("cv.editor.entryInput.subtitlePlaceholder")}
                    value={entry.subtitle}
                    name={`${sectionKey}_${entryIndex}_subtitle`}
                    onChange={(val) => form.setFieldValue(`${pathPrefix}.content.${entryIndex}.subtitle`, val)}
                    isValid={isValid}
                    isError={isError}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <ValidatableDateInput
                    placeholder={t("cv.editor.entryInput.startDatePlaceholder")}
                    value={entry.start_date || ""}
                    name={`${sectionKey}_${entryIndex}_start_date`}
                    onChange={(val) => form.setFieldValue(`${pathPrefix}.content.${entryIndex}.start_date`, val || null)}
                    isValid={isValid}
                    isError={isError}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <ValidatableDateInput
                    placeholder={t("cv.editor.entryInput.endDatePlaceholder")}
                    value={entry.end_date || ""}
                    name={`${sectionKey}_${entryIndex}_end_date`}
                    onChange={(val) => form.setFieldValue(`${pathPrefix}.content.${entryIndex}.end_date`, val || null)}
                    isValid={isValid}
                    isError={isError}
                  />
                </Grid.Col>
              </Grid>

              {/* Bullet Points Section */}
              <Box mt="md">
                <Text size="xs" fw={600} mb="xs">
                  {t("cv.editor.entryInput.bulletPointsLabel")}
                </Text>
                <Stack gap="xs">
                  {entry.bullet_points?.map((bp, bpIndex) => (
                    <Flex key={bpIndex} gap="xs" align="center">
                      <Box style={{ flex: 1 }}>
                        <ValidatableInput
                          placeholder={t("cv.editor.entryInput.bulletPointPlaceholder")}
                          value={bp}
                          name={`${sectionKey}_${entryIndex}_bp_${bpIndex}`}
                          onChange={(val) => form.setFieldValue(`${pathPrefix}.content.${entryIndex}.bullet_points.${bpIndex}`, val)}
                          isValid={isValid}
                          isError={isError}
                        />
                      </Box>
                      {entry.bullet_points.length > 1 && (
                        <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveBullet(entryIndex, bpIndex)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Flex>
                  ))}
                </Stack>
                <Button
                  leftSection={<IconPlus size={14} />}
                  variant="subtle"
                  size="xs"
                  mt="xs"
                  onClick={() => handleAddBullet(entryIndex)}
                >
                  {t("cv.editor.form.addBulletPoint")}
                </Button>
              </Box>
            </Paper>
          ))}
        </Stack>

        <Button mt="md" variant="light" leftSection={<IconPlus size={16} />} onClick={handleAddEntry}>
          {t("cv.editor.form.addEntryButton")}
        </Button>
      </Paper>
    </FormBlockContainer>
  );
}