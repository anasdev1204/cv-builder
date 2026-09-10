import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  NativeSelect,
  Stack,
  Text,
  Title,
  ThemeIcon,
  Grid,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { IconFileText } from '@tabler/icons-react';

import { isSectionEntry, type SectionEntry, type CVRaw } from '@/types';

import ValidatableInput from '@/components/cv-editor/validatable-input';
import EntryPicker from '@/components/cv-section-pickers/entry-picker';
import ListPicker from '@/components/cv-section-pickers/list-picker';

import { useCV } from '@/hooks/useDB/useCV';
import ParagraphPicker from '@/components/cv-section-pickers/paragraph-picker';

import { compileCV } from '@/api/cvCompile';
import { useAPI } from '@/hooks/useAPI';

export default function CompileCVView() {
  const { data: cv } = useCV();
  const { loading: isLoading, error, execute } = useAPI(compileCV);

  const { t } = useTranslation();

  const availableVersions = useMemo(() => Object.keys(cv?.sections || {}), [cv]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVersion(availableVersions[0] || '');
  }, [availableVersions]);
  const activeVersion = useMemo(() => {
    if (cv && selectedVersion) {
      return cv.sections[selectedVersion];
    }
    return null;
  }, [cv, selectedVersion]);

  // The data will be stored as a path from the selected version to the actual data to exclude as a string, i.e experience.content[1] or skills.content[2] or summary
  const [excludedData, setExcludedData] = useState<string[]>([]);

  const [jobTitle, setJobTitle] = useState<string>('');

  // TODO: Add useTemplate hook to dynamically load configuration and layout styling for the selected template
  const availabelTemplates = ['modern', 'professional'];
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');

  const toggleEntry = (sectionKey: string, entryIndex: number) => {
    setExcludedData((prev) => {
      const entryPath = `${sectionKey}.content.${entryIndex}`;

      if (prev.includes(entryPath)) {
        return prev.filter((path) => path !== entryPath);
      }

      return [...prev, entryPath];
    });
  };

  const toggleBulletPoint = (sectionKey: string, entryIndex: number, bulletIndex: number) => {
    setExcludedData((prev) => {
      const bulletPath = `${sectionKey}.content.${entryIndex}.${bulletIndex}`;

      if (prev.includes(bulletPath)) {
        return prev.filter((path) => path !== bulletPath);
      }

      return [...prev, bulletPath];
    });
  };

  const handleCompile = async () => {
    try {
      if (!jobTitle) {
        throw new Error('Job title is required');
      }
      const blob = await execute({
        cv_data: cv as CVRaw,
        job_title: jobTitle,
        template_name: selectedTemplate,
        template_config: null, // TODO: Add template configuration
        output_format: 'pdf',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `${jobTitle.replace(/\s+/g, '_')}_CV.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const navigate = useNavigate();
  if (availableVersions.length === 0 || activeVersion === null) {
    return (
      <Box p="md">
        <Stack align="center" gap="md">
          <ThemeIcon size={56} radius="xl" variant="light">
            <IconFileText size={28} />
          </ThemeIcon>

          <Stack align="center" gap={4}>
            <Title order={3}>{t('cv.editor.noCV.title')}</Title>

            <Text c="dimmed" ta="center" maw={400}>
              {t('cv.editor.noCV.description')}
            </Text>
          </Stack>

          <Button onClick={() => navigate('/editcv')} size="md">
            {t('cv.editor.noCV.button')}
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Stack gap="lg" w="100%">
      {error && (
        <Text c="red" ta="center">
          {error}
        </Text>
      )}
      <Flex align="start" w="100%" gap="md" direction="column">
        <Title order={2}>{t('cv.editor.compile.title')}</Title>

        <Grid w="100%">
          <Grid.Col span={6}>
            <NativeSelect
              label={t('cv.editor.form.versionDropdownLabel')}
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.currentTarget.value)}
              data={availableVersions}
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <NativeSelect
              label={t('cv.editor.compile.templateLabel')}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.currentTarget.value)}
              data={availabelTemplates}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <ValidatableInput
              placeholder={t('cv.editor.compile.jobTitlePlaceholder')}
              value={jobTitle}
              onChange={(value) => setJobTitle(value)}
              name="jobTitle"
            />
          </Grid.Col>
        </Grid>
        <Button
          color="blue"
          onClick={handleCompile}
          mx="auto"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading
            ? t('cv.editor.compile.compilingButton')
            : t('cv.editor.compile.compileButton')}
        </Button>
      </Flex>

      <Divider />

      <ParagraphPicker
        sectionKey="summary"
        excludedData={excludedData}
        section={{
          title: activeVersion.summary.title,
          content: activeVersion.summary.content as string[],
        }}
        toggleParagraph={toggleEntry}
      />

      <EntryPicker
        sectionKey="experience"
        excludedData={excludedData}
        section={{
          title: activeVersion.experience.title,
          content: activeVersion.experience.content as SectionEntry[],
        }}
        toggleEntry={toggleEntry}
        toggleBulletPoint={toggleBulletPoint}
      />

      <EntryPicker
        sectionKey="education"
        excludedData={excludedData}
        section={{
          title: activeVersion.education.title,
          content: activeVersion.education.content as SectionEntry[],
        }}
        toggleEntry={toggleEntry}
        toggleBulletPoint={toggleBulletPoint}
      />

      <ListPicker
        sectionKey="skills"
        excludedData={excludedData}
        section={{
          title: activeVersion.skills.title,
          content: activeVersion.skills.content as string[],
        }}
        toggleListItem={toggleEntry}
      />

      <ListPicker
        sectionKey="languages"
        excludedData={excludedData}
        section={{
          title: activeVersion.languages.title,
          content: activeVersion.languages.content as string[],
        }}
        toggleListItem={toggleEntry}
      />

      {Object.entries(activeVersion.other_sections).map(([key, section]) => {
        if (typeof section.content === 'string') {
          return (
            <ParagraphPicker
              key={key}
              sectionKey={'other_sections.' + key}
              excludedData={excludedData}
              section={{
                title: section.title,
                content: [section.content],
              }}
              toggleParagraph={toggleEntry}
            />
          );
        }

        if (Array.isArray(section.content) && typeof section.content[0] === 'string') {
          return (
            <ListPicker
              key={key}
              sectionKey={'other_sections.' + key}
              excludedData={excludedData}
              section={{
                title: section.title,
                content: section.content as string[],
              }}
              toggleListItem={toggleEntry}
            />
          );
        }

        if (Array.isArray(section.content) && isSectionEntry(section.content[0])) {
          return (
            <EntryPicker
              key={key}
              sectionKey={'other_sections.' + key}
              excludedData={excludedData}
              section={{
                title: section.title,
                content: section.content as SectionEntry[],
              }}
              toggleEntry={toggleEntry}
              toggleBulletPoint={toggleBulletPoint}
            />
          );
        }
      })}
    </Stack>
  );
}
