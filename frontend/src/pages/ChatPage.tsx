import React from 'react';
import { Box, Typography } from '@mui/material';
import ChatWindow from '../components/Chat/ChatWindow';

const ChatPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI HVAC Assistant
      </Typography>
      <Typography variant="body1" paragraph>
        Ask any questions about HVAC systems, calculations, or best practices.
      </Typography>
      <ChatWindow />
    </Box>
  );
};

export default ChatPage;