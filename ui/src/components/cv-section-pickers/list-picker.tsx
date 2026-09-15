import { Checkbox, Group, Paper, Title } from '@mantine/core';

interface ListPickerProps {
  sectionKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  excluded_data: Record<string, any>;
  section: {
    title: string;
    content: string[];
  };
  toggleListItem: (sectionKey: string, listItemIdx: number) => void;
}

export default function ListPicker({
  sectionKey,
  excluded_data,
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
          let isExcluded: boolean;

          if (sectionKey.includes('other_sections/')) {
            const otherSectionKey = sectionKey.split('other_sections/')[1];
            isExcluded = excluded_data['other_sections']?.[otherSectionKey]?.[0] === false;
          } else {
            isExcluded = excluded_data[sectionKey]?.[itemIdx] === false;
          }

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
