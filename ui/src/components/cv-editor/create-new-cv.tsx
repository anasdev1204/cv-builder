import { Box, Button, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconFileText, IconPlus } from '@tabler/icons-react';
import type { TFunction } from 'i18next';

type CreateNewCVSectionProps = {
  t: TFunction;
  initCv: () => void;
};

export default function CreateNewCVSection({ t, initCv }: CreateNewCVSectionProps) {
  return (
    <Box
      w="100%"
      h="100%"
      mih={300}
      display="flex"
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
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

        <Button onClick={initCv} size="md" leftSection={<IconPlus size={18} />}>
          {t('cv.editor.noCV.button')}
        </Button>
      </Stack>
    </Box>
  );
}
