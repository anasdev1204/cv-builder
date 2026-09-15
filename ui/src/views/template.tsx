import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  TextInput,
  NumberInput,
  ColorInput,
  Switch,
  Select,
  Group,
  Stack,
  Button,
  Grid,
  Divider,
  LoadingOverlay,
  Text,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import type { TemplateConfig } from '@/types';
import { useTemplate } from '@/hooks/useDB/useTemplate';
import { db, type StoredTemplate } from '@/db/database';

const DEFAULT_CONFIG: TemplateConfig = {
  page: { margins: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 } },
  font: {
    family: 'Inter',
    size: 10,
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    character_spacing: 0,
  },
  header: {
    alignment: 'center',
    name: {
      family: 'Inter',
      size: 24,
      bold: true,
      italic: false,
      underline: false,
      color: '#000000',
      character_spacing: 0,
    },
    contact: {
      family: 'Inter',
      size: 9,
      bold: false,
      italic: false,
      underline: false,
      color: '#4A5568',
      character_spacing: 0,
      separator: ' • ',
    },
    job_title: {
      family: 'Inter',
      size: 14,
      bold: true,
      italic: false,
      underline: false,
      color: '#2B6CB0',
      character_spacing: 0,
    },
    show_picture: false,
    picture_size: 60,
    space_before: 0,
    space_after: 12,
    show_divider: true,
    divider_thickness: 1,
    divider_color: '#E2E8F0',
  },
  section: {
    heading: {
      size: 14,
      bold: true,
      italic: false,
      uppercase: true,
      underline: false,
      color: '#2D3748',
      space_before: 12,
      space_after: 6,
      show_divider: true,
      divider_thickness: 1,
      divider_color: '#CBD5E0',
    },
    space_before: 8,
    space_after: 8,
    renderer: {
      renderer: 'entries',
      entry: null,
      separator: null,
      show_heading: true,
      space_before: null,
      space_after: null,
    },
  },
  entry: {
    layout: 'stacked',
    space_before: 4,
    space_after: 8,
    title: {
      family: 'Inter',
      size: 11,
      bold: true,
      italic: false,
      underline: false,
      color: '#1A202C',
      character_spacing: 0,
    },
    subtitle: {
      family: 'Inter',
      size: 10,
      bold: false,
      italic: true,
      underline: false,
      color: '#4A5568',
      character_spacing: 0,
    },
    subtitle_separator: ' | ',
    dates: {
      family: 'Inter',
      size: 10,
      bold: false,
      italic: true,
      color: '#718096',
      character_spacing: 0,
      separator: ' - ',
      format: 'month_year',
      space_before: 0,
      space_after: 0,
      show_start_date: true,
      show_end_date: true,
      underline: false,
      current_label: 'Present',
    },
    bullets: {
      symbol: '•',
      size: 10,
      indent: 12,
      hanging_indent: null,
      space_before: 2,
      space_after: 2,
      line_spacing: 1.15,
      alignment: 'left',
    },
    show_dates: true,
    show_bullets: true,
    show_subtitle: true,
    title_position: 'left',
    date_position: 'right',
  },
  list: {
    separator: ', ',
    size: 10,
    font: {
      family: 'Inter',
      size: 10,
      bold: false,
      italic: false,
      underline: false,
      color: '#2D3748',
      character_spacing: 0,
    },
    space_before: 2,
    space_after: 2,
    alignment: 'left',
  },
  sections: {},
};

export default function TemplateView() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [templateList, setTemplateList] = useState<StoredTemplate[]>([]);
  const { templates, loading, saving, saveConfig } = useTemplate(selectedId);

  const [name, setName] = useState('New Template');
  const [config, setConfig] = useState<TemplateConfig>(DEFAULT_CONFIG);

  // Fetch index of all saved templates for the dropdown
  const loadTemplatesList = useCallback(async () => {
    const all = await db.templates.toArray();
    setTemplateList(all);
    if (all.length > 0 && !selectedId) {
      setSelectedId(all[0].id);
    }
  }, [selectedId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTemplatesList();
  }, [loadTemplatesList]);

  // Sync form state when active template selection updates
  useEffect(() => {
    if (templates && templates.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(templates[0].name);
      setConfig(templates[0].config);
      setSelectedId(templates[0].id);
    }
  }, [templates]);

  // Switch to creating a brand new template
  const handleCreateNew = () => {
    const newId = crypto.randomUUID();
    setSelectedId(newId);
    setName('Untitled Template');
    setConfig(DEFAULT_CONFIG);
  };

  // Delete current template
  const handleDelete = async () => {
    if (!selectedId) return;
    await db.templates.delete(selectedId);
    const remaining = await db.templates.toArray();
    setTemplateList(remaining);
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      handleCreateNew();
    }
  };

  const handleSave = async () => {
    const idToSave = selectedId || crypto.randomUUID();
    if (!selectedId) setSelectedId(idToSave);

    await saveConfig(name, config);
    await loadTemplatesList();
  };

  return (
    <Container size="md" py="xl" pos="relative">
      <LoadingOverlay visible={loading} />

      <Paper shadow="sm" p="xl" radius="md" withBorder>
        {/* Header with Template Selector */}
        <Group justify="space-between" align="flex-end" mb="lg">
          <div>
            <Title order={2}>Template Editor</Title>
            <Text size="sm" c="dimmed">
              Select an existing template to edit or create a new one.
            </Text>
          </div>
          <Group align="flex-end">
            <Select
              label="Select Template"
              placeholder="Choose a template"
              data={templateList.map((t) => ({ value: t.id, label: t.name }))}
              value={selectedId}
              onChange={(val) => val && setSelectedId(val)}
              style={{ minWidth: 220 }}
            />
            <Tooltip label="Create New Template">
              <ActionIcon variant="light" color="blue" size="input-bg" onClick={handleCreateNew}>
                <IconPlus size={18} />
              </ActionIcon>
            </Tooltip>
            {selectedId && (
              <Tooltip label="Delete Template">
                <ActionIcon variant="light" color="red" size="input-bg" onClick={handleDelete}>
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        <Divider mb="lg" />

        <Stack gap="lg">
          {/* Metadata */}
          <TextInput
            label="Template Name"
            placeholder="e.g. Modern Executive"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Divider label="Page Setup" labelPosition="left" />
          <Grid>
            <Grid.Col span={3}>
              <NumberInput
                label="Margin Top (in)"
                value={config.page.margins.top}
                decimalScale={2}
                step={0.1}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    page: { ...c.page, margins: { ...c.page.margins, top: Number(v) } },
                  }))
                }
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="Margin Bottom (in)"
                value={config.page.margins.bottom}
                decimalScale={2}
                step={0.1}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    page: { ...c.page, margins: { ...c.page.margins, bottom: Number(v) } },
                  }))
                }
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="Margin Left (in)"
                value={config.page.margins.left}
                decimalScale={2}
                step={0.1}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    page: { ...c.page, margins: { ...c.page.margins, left: Number(v) } },
                  }))
                }
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                label="Margin Right (in)"
                value={config.page.margins.right}
                decimalScale={2}
                step={0.1}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    page: { ...c.page, margins: { ...c.page.margins, right: Number(v) } },
                  }))
                }
              />
            </Grid.Col>
          </Grid>

          <Divider label="Global Typography" labelPosition="left" />
          <Grid align="end">
            <Grid.Col span={4}>
              <Select
                label="Font Family"
                data={['Inter', 'Roboto', 'Arial', 'Merriweather', 'Times New Roman']}
                value={config.font.family}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, font: { ...c.font, family: v || 'Inter' } }))
                }
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Base Font Size (pt)"
                value={config.font.size}
                onChange={(v) => setConfig((c) => ({ ...c, font: { ...c.font, size: Number(v) } }))}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <ColorInput
                label="Text Color"
                value={config.font.color}
                onChange={(v) => setConfig((c) => ({ ...c, font: { ...c.font, color: v } }))}
              />
            </Grid.Col>
          </Grid>

          <Divider label="Header Options" labelPosition="left" />
          <Grid align="center">
            <Grid.Col span={4}>
              <Select
                label="Alignment"
                data={['left', 'center', 'right']}
                value={config.header.alignment}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    header: {
                      ...c.header,
                      alignment: (v as 'left' | 'center' | 'right') || 'center',
                    },
                  }))
                }
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Name Size (pt)"
                value={config.header.name.size}
                onChange={(v) =>
                  setConfig((c) => ({
                    ...c,
                    header: { ...c.header, name: { ...c.header.name, size: Number(v) } },
                  }))
                }
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Switch
                label="Show Divider Line"
                checked={config.header.show_divider}
                onChange={(e) =>
                  setConfig((c) => ({
                    ...c,
                    header: { ...c.header, show_divider: e.currentTarget.checked },
                  }))
                }
              />
            </Grid.Col>
          </Grid>

          <Group justify="end" mt="md">
            <Button loading={saving} onClick={handleSave} color="blue">
              Save Template
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  );
}
