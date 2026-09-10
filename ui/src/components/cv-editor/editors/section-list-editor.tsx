import { Button, ActionIcon, Flex, Stack, Text, Paper } from '@mantine/core';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import type { TFunction } from 'i18next';
import type { CVRaw } from '@/types';
import ValidatableInput from '@/components/cv-editor/validatable-input';
import FormBlockContainer from '@/components/cv-editor/components/form-block-container';

type SectionListEditorProps = {
  t: TFunction;
  form: UseFormReturnType<CVRaw>;
  version: string;
  sectionKey: string;
  sectionTitle: string;
  isValid: boolean;
  isError: boolean;
};

export default function SectionListEditor({
  t,
  form,
  version,
  sectionKey,
  sectionTitle,
  isValid,
  isError,
}: SectionListEditorProps) {
  const pathPrefix = `sections.${version}.${sectionKey}`;
  const listItems = sectionKey.includes('other_sections')
    ? (form.values.sections[version]?.['other_sections']?.[sectionKey.split('.')[1] as string]
        ?.content as string[])
    : (form.values.sections[version]?.[
        sectionKey as keyof (typeof form.values.sections)[typeof version]
      ]?.content as string[]) || [];

  const handleAddItem = () => {
    form.insertListItem(`${pathPrefix}.content`, '');
  };

  const handleRemoveItem = (index: number) => {
    form.removeListItem(`${pathPrefix}.content`, index);
  };

  return (
    <FormBlockContainer path={pathPrefix} errors={form.errors} t={t}>
      <Paper p="md" withBorder mb="md">
        <Text fw={600} mb="xs">
          {sectionTitle}
        </Text>
        <ValidatableInput
          placeholder={t('cv.editor.entryInput.sectionTitlePlaceholder')}
          value={
            sectionKey.includes('other_sections')
              ? (form.values.sections[version]?.['other_sections']?.[
                  sectionKey.split('.')[1] as string
                ]?.title as string)
              : (form.values.sections[version]?.[
                  sectionKey as keyof (typeof form.values.sections)[typeof version]
                ]?.title as string)
          }
          name={`${sectionKey}_title`}
          onChange={(val) => form.setFieldValue(`${pathPrefix}.title`, val)}
          isValid={isValid}
          isError={isError}
        />

        <Stack gap="xs" mt="md">
          {listItems.map((item, index) => (
            <Flex key={index} gap="xs" align="center">
              <Paper flex={1}>
                <ValidatableInput
                  placeholder={t('cv.editor.listInput.itemPlaceholder')}
                  value={item}
                  name={`${sectionKey}_item_${index}`}
                  onChange={(val) => form.setFieldValue(`${pathPrefix}.content.${index}`, val)}
                  isValid={isValid}
                  isError={isError}
                />
              </Paper>
              <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveItem(index)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Flex>
          ))}
        </Stack>

        <Button
          mt="md"
          variant="light"
          leftSection={<IconPlus size={16} />}
          onClick={handleAddItem}
        >
          {t('cv.editor.form.addListItem')}
        </Button>
      </Paper>
    </FormBlockContainer>
  );
}
