import CVView from '@/views/cv';
import { Box } from '@mantine/core';

function App() {
  return (
    <Box bg="gray.1" mih="100vh">
      <Box mx="auto" maw={1024} p="md" bg="white" bd="1px solid gray.2" mih="100vh">
        <CVView />
      </Box>
    </Box>
  );
}

export default App;
