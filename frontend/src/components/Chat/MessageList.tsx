import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { Message } from '../../types/chat';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <Box sx={{ 
      flexGrow: 1, 
      overflowY: 'auto',
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}>
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'flex-start',
            flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
          }}
        >
          <Avatar sx={{ bgcolor: message.sender === 'ai' ? 'primary.main' : 'secondary.main' }}>
            {message.sender === 'ai' ? <SmartToyIcon /> : <PersonIcon />}
          </Avatar>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              maxWidth: '70%',
              bgcolor: message.sender === 'ai' ? 'grey.100' : 'primary.light',
              color: message.sender === 'ai' ? 'text.primary' : 'white'
            }}
          >
            <Typography variant="body1">{message.text}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default MessageList;