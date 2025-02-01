import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import { useChat } from '../../hooks/useChat';

const ChatWindow: React.FC = () => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const { sendMessage, isLoading } = useChat();
  const messages = useSelector((state: RootState) => state.chat.messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (message.trim()) {
      await sendMessage(message);
    }
  };

  return (
    <Paper elevation={3} sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <MessageList messages={messages} />
      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      <div ref={messagesEndRef} />
    </Paper>
  );
};

export default ChatWindow;