import { Checkbox, Group, Paper, Title } from '@mantine/core';

interface ListPickerProps {
  sectionKey: string;
  excludedData: string[];
  section: {
    title: string;
    content: string[];
  };
  toggleListItem: (sectionKey: string, listItemIdx: number) => void;
}

export default function ListPicker({
  sectionKey,
  excludedData,
  section,
  toggleListItem,
}: ListPickerProps) {
  return (
    <Paper key={sectionKey} p="md" withBorder>
      <Title order={4} mb="sm">
        {section.title || sectionKey}
      </Title>
      <Group gap="sm">
        {section.content.map((item: string, itemIdx: number) => {
          const isExcluded = excludedData.includes(`${sectionKey}.content.${itemIdx}`);
          return (
            <Checkbox
              key={itemIdx}
              checked={!isExcluded}
              onChange={() => toggleListItem(sectionKey, itemIdx)}
              label={item}
            />
          );
        })}
      </Group>
    </Paper>
  );
}
