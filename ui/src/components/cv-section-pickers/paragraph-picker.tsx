import { Checkbox, Group, Paper, Title } from '@mantine/core';

interface ListPickerProps {
  sectionKey: string;
  excludedData: string[];
  section: {
    title: string;
    content: string[];
  };
  toggleParagraph: (sectionKey: string, paragraphIdx: number) => void;
}

export default function ParagraphPicker({
  sectionKey,
  excludedData,
  section,
  toggleParagraph,
}: ListPickerProps) {
  const isExcluded = excludedData.includes(`${sectionKey}.content.0`);
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
