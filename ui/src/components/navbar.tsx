import { Box, Flex, Group, NativeSelect, Anchor } from '@mantine/core';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const { i18n } = useTranslation();
  const location = useLocation();

  const navLinks = [
    { label: 'Edit CV', path: '/editcv' },
    { label: 'Compile CV', path: '/compilecv' },
    { label: 'Match CV', path: '/matchcv' },
    { label: 'Templates', path: '/templates' },
  ];

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Box bg="gray.1 " bd="0 0 1px solid gray.2 " py="sm" px="md">
      <Flex align="center" pos="relative" maw={1200} mx="auto">
        {/* Centered Navigation Links */}
        <Group justify="center" gap="xl" style={{ flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Anchor
                key={link.path}
                component={RouterLink}
                to={link.path}
                fw={500}
                c={isActive ? 'blue.6' : 'gray.6'}
                bg={isActive ? 'blue.1' : 'transparent'}
                bdrs="md"
                underline="never"
                style={{
                  padding: '4px 8px',
                }}
              >
                {link.label}
              </Anchor>
            );
          })}
        </Group>

        {/* Far-Right Language Switcher */}
        <Box pos="absolute" style={{ right: 0 }}>
          <NativeSelect
            size="xs"
            value={i18n.language}
            onChange={(e) => handleLanguageChange(e.currentTarget.value)}
            data={[
              { label: 'English', value: 'en' },
              { label: 'Français', value: 'fr' },
            ]}
          />
        </Box>
      </Flex>
    </Box>
  );
}