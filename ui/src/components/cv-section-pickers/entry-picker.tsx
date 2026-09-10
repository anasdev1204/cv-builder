import type { SectionEntry } from '@/types';
import { Card, Checkbox, Paper, Stack, Title, Text } from '@mantine/core';

interface EntryPickerProps {
  sectionKey: string;
  excludedData: string[];
  section: {
    title: string;
    content: SectionEntry[];
  };
  toggleEntry: (sectionKey: string, entryIdx: number) => void;
  toggleBulletPoint: (sectionKey: string, entryIdx: number, bpIdx: number) => void;
}

export default function EntryPicker({
  excludedData,
  sectionKey,
  section,
  toggleEntry,
  toggleBulletPoint,
}: EntryPickerProps) {
  return (
    <Paper key={sectionKey} p="md" withBorder>
      <Title order={4} mb="sm">
        {section.title || sectionKey}
      </Title>
      <Stack gap="md">
        {section.content.map((entry: SectionEntry, entryIdx: number) => {
          const isEntryExcluded = excludedData.includes(`${sectionKey}.content.${entryIdx}`);
          return (
            <Card key={entryIdx} withBorder bg={isEntryExcluded ? 'gray.1' : 'white'}>
              <Checkbox
                checked={!isEntryExcluded}
                onChange={() => toggleEntry(sectionKey, entryIdx)}
                label={
                  <Text fw={600}>
                    {entry.title || 'Untitled Entry'} {entry.subtitle ? `- ${entry.subtitle}` : ''}
                  </Text>
                }
              />

              {!isEntryExcluded && entry.bullet_points?.length > 0 && (
                <Stack gap="xs" mt="sm" ml="lg">
                  {entry.bullet_points.map((bp: string, bpIdx: number) => {
                    const isBpExcluded = excludedData.includes(
                      `${sectionKey}.content.${entryIdx}.${bpIdx}`,
                    );
                    return (
                      <Checkbox
                        key={bpIdx}
                        size="xs"
                        checked={!isBpExcluded}
                        onChange={() => toggleBulletPoint(sectionKey, entryIdx, bpIdx)}
                        label={bp}
                      />
                    );
                  })}
                </Stack>
              )}
            </Card>
          );
        })}
      </Stack>
    </Paper>
  );
}
