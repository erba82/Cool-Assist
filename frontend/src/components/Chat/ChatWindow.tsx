import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  List, 
  ListItem, 
  ListItemText,
  Paper,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatWindow = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      // Add user message
      setMessages(prev => [...prev, { text: input, isBot: false }]);
      
      // Simulate bot response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: "This is a sample response from the HVAC assistant.", 
          isBot: true 
        }]);
      }, 1000);
      
      setInput('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 2, height: '70vh' }}>
      <List sx={{ 
        height: 'calc(100% - 72px)', 
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}>
        {messages.map((msg, index) => (
          <ListItem key={index} sx={{ 
            justifyContent: msg.isBot ? 'flex-start' : 'flex-end'
          }}>
            <Paper 
              elevation={1} 
              sx={{ 
                p: 1.5,
                bgcolor: msg.isBot ? 'secondary.light' : 'primary.light',
                color: msg.isBot ? 'text.primary' : 'common.white',
                maxWidth: '70%'
              }}
            >
              <ListItemText 
                primary={msg.text} 
                sx={{ wordBreak: 'break-word' }}
              />
            </Paper>
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your HVAC question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button
          variant="contained"
          color="primary"
          endIcon={<SendIcon />}
          onClick={handleSend}
          disabled={!input.trim()}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatWindow;