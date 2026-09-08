import { Box, Flex, Text, TextInput } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';

type InputState = 'idle' | 'editing' | 'error' | 'validated';

interface ValidatableInputProps {
  value: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  isValid?: boolean;
  isError?: boolean;
}

export default function ValidatableInput({
  value,
  name,
  onChange,
  placeholder,
  isValid = false,
  isError = false,
}: ValidatableInputProps) {
  const [state, setState] = useState<InputState>('idle');

  const toggleState = useCallback(
    (newState: InputState) => {
      const hasValue = value.trim() !== '';

      if (newState !== 'idle' || !hasValue) {
        setState(newState);
      }

      if (newState === 'editing' && !hasValue) {
        setState('idle');
      }
    },
    [value],
  );

  useEffect(() => {
    if (isValid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      toggleState('validated');
    } else if (isError) {
      toggleState('error');
    } else {
      toggleState('editing');
    }
  }, [isValid, isError, toggleState]);

  return (
    <Box pos="relative">
      {state !== 'validated' ? (
        <>
          <TextInput
            name={name}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
            onFocus={() => toggleState('editing')}
            onBlur={() => toggleState('idle')}
            error={state === 'error'}
          />

          <Text
            pos="absolute"
            size="sm"
            mx="md"
            top={8}
            c="gray.6"
            bg="white"
            fw={500}
            style={{
              pointerEvents: 'none',
              transform:
                state === 'editing' || value
                  ? 'translateY(-75%) scale(0.75)'
                  : 'translateY(0) scale(1)',
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease, color 0.2s ease',
            }}
          >
            {placeholder}
          </Text>
        </>
      ) : (
        <>
          <Box>
            <Text size="sm" c="gray.9" fw={500}>
              {placeholder}
            </Text>
            <Flex align="center" gap="xs" mt={4}>
              <Text size="sm" c="gray.6" fs="italic">
                {value}
              </Text>
              {value.trim() !== '' && <IconCircleCheck size={12} color="green" />}
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
}
