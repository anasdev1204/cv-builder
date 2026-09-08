import { Flex, Paper, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { TFunction } from 'i18next';
import type { CVRaw } from '@/types';
import ValidatableInput from '@/components/cv-editor/components/validatable-input';
import ValidatableTextarea from '@/components/cv-editor/components/validatable-textarea';
import FormBlockContainer from '@/components/cv-editor/components/form-block-container';

type SectionParagraphEditorProps = {
  t: TFunction;
  form: UseFormReturnType<CVRaw>;
  version: string;
  sectionKey: string;
  sectionTitle: string;
  isValid: boolean;
  isError: boolean;
};

export default function SectionParagraphEditor({
  t,
  form,
  version,
  sectionKey,
  sectionTitle,
  isValid,
  isError,
}: SectionParagraphEditorProps) {
  const pathPrefix = `sections.${version}.${sectionKey}`;

  return (
    <FormBlockContainer path={pathPrefix} errors={form.errors} t={t}>
      <Paper p="md" withBorder mb="md">
        <Text fw={600} mb="xs">
          {sectionTitle}
        </Text>
        <Flex direction="column" gap="md">
          <ValidatableInput
            placeholder={t('cv.editor.summaryInput.titlePlaceholder')}
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
          <ValidatableTextarea
            placeholder={t('cv.editor.summaryInput.contentPlaceholder')}
            value={
              sectionKey.includes('other_sections')
                ? (form.values.sections[version]?.['other_sections']?.[
                    sectionKey.split('.')[1] as string
                  ]?.content as string)
                : (form.values.sections[version]?.[
                    sectionKey as keyof (typeof form.values.sections)[typeof version]
                  ]?.content as string)
            }
            name={`${sectionKey}_content`}
            onChange={(val) => form.setFieldValue(`${pathPrefix}.content`, val)}
            isValid={isValid}
            isError={isError}
          />
        </Flex>
      </Paper>
    </FormBlockContainer>
  );
}
