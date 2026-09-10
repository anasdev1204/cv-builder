import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mantine/core';
import EditCVView from '@/views/edit-cv';
import Navbar from '@/components/navbar';
import CompileCVView from './views/compile-cv';

function App() {
  return (
    <BrowserRouter>
      <Box bg="gray.1" mih="100vh">
        <Navbar />
        <Box mx="auto" maw={1024} p="md" bg="white" bd="1px solid gray.2" mih="calc(100vh - 60px)">
          <Routes>
            {/* Automatic redirect from / to /editcv */}
            <Route path="/" element={<Navigate to="/editcv" replace />} />

            {/* Main Edit CV Route */}
            <Route path="/editcv" element={<EditCVView />} />

            {/* Placeholder routes for the remaining nav links */}
            <Route path="/compilecv" element={<CompileCVView />} />
            <Route path="/matchcv" element={<Box>Match CV View</Box>} />
            <Route path="/templates" element={<Box>Templates View</Box>} />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/editcv" replace />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
