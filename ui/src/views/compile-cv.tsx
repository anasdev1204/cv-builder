/* eslint-disable react-hooks/set-state-in-effect */
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

import { isSectionEntry, type CVRaw, type SectionEntry, type TemplateConfig } from '@/types';

import ValidatableInput from '@/components/cv-editor/validatable-input';
import EntryPicker from '@/components/cv-section-pickers/entry-picker';
import ListPicker from '@/components/cv-section-pickers/list-picker';

import { useCV } from '@/hooks/useDB/useCV';
import ParagraphPicker from '@/components/cv-section-pickers/paragraph-picker';

import { compileCV } from '@/api/cvCompile';
import { getTemplates } from '@/api/getTemplates';
import { useAPI } from '@/hooks/useAPI';
import { useTemplate } from '@/hooks/useDB/useTemplate';

export default function CompileCVView() {
  const { data: cv } = useCV();
  const { loading: isCvCompiling, error: cvError, execute } = useAPI(compileCV);
  const { data: fetchedTemplates, execute: fetchTemplates } = useAPI(getTemplates);
  const { templates: localTemplates, reload } = useTemplate();
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);
  useEffect(() => {
    reload();
  }, [reload]);

  const { t } = useTranslation();

  const availableVersions = useMemo(() => Object.keys(cv?.sections || {}), [cv]);
  const [selectedVersion, setSelectedVersion] = useState<string>('');

  useEffect(() => {
    setSelectedVersion(availableVersions[0] || '');
  }, [availableVersions]);
  const activeVersion = useMemo(() => {
    if (cv && selectedVersion) {
      return cv.sections[selectedVersion];
    }
    return null;
  }, [cv, selectedVersion]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [excludedData, setExcludedData] = useState<Record<string, any>>({});

  const [jobTitle, setJobTitle] = useState<string>('');

  const [templates, setTemplates] = useState<Record<string, TemplateConfig>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<string>('professional-server');

  const availableFormats = useMemo<string[]>(() => ['pdf', 'docx'], []);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');

  useEffect(() => {
    if (fetchedTemplates) {
      setTemplates((prev) => {
        const remappedTemplates: Record<string, TemplateConfig> = {};
        for (const template in fetchedTemplates.templates) {
          remappedTemplates[template + '-' + 'server'] = fetchedTemplates.templates[template];
        }
        return {
          ...prev,
          ...remappedTemplates,
        };
      });
      setSelectedTemplate(Object.keys(fetchedTemplates.templates)[0] || 'professional-server');
    }
  }, [fetchedTemplates]);

  useEffect(() => {
    if (localTemplates) {
      setTemplates((prev) => {
        const remappedTemplates: Record<string, TemplateConfig> = {};
        for (const template in localTemplates) {
          remappedTemplates[localTemplates[template].name + '-' + 'local'] =
            localTemplates[template].config;
        }
        return {
          ...prev,
          ...remappedTemplates,
        };
      });

      setSelectedTemplate(localTemplates[0]?.name + '-local' || 'professional-server');
    }
  }, [localTemplates]);

  const toggleEntry = (sectionKey: string, entryIndex: number) => {
    setExcludedData((prev) => {
      const isOtherSection = sectionKey.startsWith('other_sections/');
      if (isOtherSection) {
        const [, otherSectionKey] = sectionKey.split('/');
        const curr = prev.other_sections?.[otherSectionKey]?.[entryIndex];
        let newValue: boolean;
        if (curr === undefined) {
          newValue = false;
        } else {
          newValue = !curr;
        }
        return {
          ...prev,
          other_sections: {
            ...prev.other_sections,
            [otherSectionKey]: {
              ...prev.other_sections?.[otherSectionKey],
              [entryIndex]: newValue,
            },
          },
        };
      }

      const curr = prev[sectionKey]?.[entryIndex];
      let newValue: boolean;
      if (curr === undefined) {
        newValue = false;
      } else {
        newValue = !curr;
      }

      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [entryIndex]: newValue,
        },
      };
    });
  };

  const toggleBulletPoint = (sectionKey: string, entryIndex: number, bulletIndex: number) => {
    setExcludedData((prev) => {
      const isOtherSection = sectionKey.startsWith('other_sections/');
      if (isOtherSection) {
        const [, otherSectionKey] = sectionKey.split('/');
        const curr = prev.other_sections?.[otherSectionKey]?.[entryIndex]?.[bulletIndex];
        let newValue: boolean;
        if (curr === undefined) {
          newValue = false;
        } else {
          newValue = !curr;
        }
        return {
          ...prev,
          other_sections: {
            ...prev.other_sections,
            [otherSectionKey]: {
              ...prev.other_sections?.[otherSectionKey],
              [entryIndex]: {
                ...prev.other_sections?.[otherSectionKey]?.[entryIndex],
                [bulletIndex]: newValue,
              },
            },
          },
        };
      }

      const curr = prev[sectionKey]?.[entryIndex]?.[bulletIndex];
      let newValue: boolean;
      if (curr === undefined) {
        newValue = false;
      } else {
        newValue = !curr;
      }

      return {
        ...prev,
        [sectionKey]: {
          ...prev[sectionKey],
          [entryIndex]: {
            ...prev[sectionKey]?.[entryIndex],
            [bulletIndex]: newValue,
          },
        },
      };
    });
  };

  useEffect(() => {
    console.log('Excluded Data:', excludedData);
  }, [excludedData]);

  const handleCompile = async () => {
    try {
      if (!jobTitle) {
        throw new Error('Job title is required');
      }

      const template_name = selectedTemplate.endsWith('-local')
        ? selectedTemplate.split('-local')[0]
        : selectedTemplate.split('-server')[0];
      let templateConfig: TemplateConfig | null = null;
      console.log(selectedTemplate);

      if (selectedTemplate.endsWith('-local')) {
        console.log('Using local template:', selectedTemplate);
        templateConfig = templates[selectedTemplate] || null;
      }

      console.log(templateConfig);

      const blob = await execute({
        cv_data: cv as CVRaw,
        job_title: jobTitle,
        template_name: template_name,
        version: selectedVersion,
        template_config: templateConfig,
        excluded_data: excludedData,
        output_format: selectedFormat,
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
      {cvError && (
        <Text c="red" ta="center">
          {cvError}
        </Text>
      )}
      <Flex align="start" w="100%" gap="md" direction="column">
        <Title order={2}>{t('cv.editor.compile.title')}</Title>

        <Grid w="100%">
          <Grid.Col span={4}>
            <NativeSelect
              label={t('cv.editor.form.versionDropdownLabel')}
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.currentTarget.value)}
              data={availableVersions}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <NativeSelect
              label={t('cv.editor.compile.templateLabel')}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.currentTarget.value)}
              data={Object.keys(templates)}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <NativeSelect
              label={t('cv.editor.compile.formatLabel')}
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.currentTarget.value)}
              data={availableFormats}
            />
          </Grid.Col>

          <Grid.Col span={12}>
            <ValidatableInput
              placeholder={t('cv.editor.compile.jobTitlePlaceholder')}
              value={jobTitle}
              onChange={(value) => setJobTitle(value)}
              name="jobTitle"
              isError={jobTitle.trim() === ''}
            />
          </Grid.Col>
        </Grid>
        <Button
          color="blue"
          onClick={handleCompile}
          mx="auto"
          loading={isCvCompiling}
          disabled={isCvCompiling}
        >
          {isCvCompiling
            ? t('cv.editor.compile.compilingButton')
            : t('cv.editor.compile.compileButton')}
        </Button>
      </Flex>

      <Divider />

      <ParagraphPicker
        sectionKey="summary"
        excluded_data={excludedData}
        section={{
          title: activeVersion.summary.title,
          content: activeVersion.summary.content as string[],
        }}
        toggleParagraph={toggleEntry}
      />

      <EntryPicker
        sectionKey="experience"
        excluded_data={excludedData}
        section={{
          title: activeVersion.experience.title,
          content: activeVersion.experience.content as SectionEntry[],
        }}
        toggleEntry={toggleEntry}
        toggleBulletPoint={toggleBulletPoint}
      />

      <EntryPicker
        sectionKey="education"
        excluded_data={excludedData}
        section={{
          title: activeVersion.education.title,
          content: activeVersion.education.content as SectionEntry[],
        }}
        toggleEntry={toggleEntry}
        toggleBulletPoint={toggleBulletPoint}
      />

      <ListPicker
        sectionKey="skills"
        excluded_data={excludedData}
        section={{
          title: activeVersion.skills.title,
          content: activeVersion.skills.content as string[],
        }}
        toggleListItem={toggleEntry}
      />

      <ListPicker
        sectionKey="languages"
        excluded_data={excludedData}
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
              sectionKey={'other_sections/' + key}
              excluded_data={excludedData}
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
              sectionKey={'other_sections/' + key}
              excluded_data={excludedData}
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
              sectionKey={'other_sections/' + key}
              excluded_data={excludedData}
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
