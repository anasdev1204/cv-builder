import { Checkbox, Group, Paper, Title } from '@mantine/core';
import { useMemo } from 'react';

interface ListPickerProps {
  sectionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excluded_data: Record<string, any>;
  section: {
    title: string;
    content: string[];
  };
  toggleParagraph: (sectionKey: string, paragraphIdx: number) => void;
}

export default function ParagraphPicker({
  sectionKey,
  excluded_data,
  section,
  toggleParagraph,
}: ListPickerProps) {
  const isExcluded = useMemo(() => {
    if (sectionKey.includes('other_sections/')) {
      const otherSectionKey = sectionKey.split('other_sections/')[1];
      return excluded_data['other_sections']?.[otherSectionKey]?.[0] === false;
    }
    return excluded_data[sectionKey]?.[0] === false;
  }, [excluded_data, sectionKey]);
  return (
    <Paper key={sectionKey} p="md" withBorder bg={isExcluded ? 'gray.1' : 'white'}>
      <Title order={4} mb="sm">
        {section.title || sectionKey}
      </Title>
      <Group gap="sm">
        <Checkbox
          checked={!isExcluded}
          onChange={() => toggleParagraph(sectionKey, 0)}
          label={section.content}
        />
      </Group>
    </Paper>
  );
}
