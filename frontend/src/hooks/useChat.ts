import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage, setLoading, setError } from '../features/chat/chatSlice';
import { aiApi } from '../services/api';
import { aiLearningService } from '../services/aiLearning';

export const useChat = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string, context?: any) => {
    try {
      setIsLoading(true);
      dispatch(setLoading(true));

      // Add user message
      const userMessageId = Date.now().toString();
      dispatch(addMessage({
        id: userMessageId,
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
        context
      }));

      // Get AI response
      const response = await aiApi.sendMessage(text, context);

      // Add AI response
      const aiMessageId = (Date.now() + 1).toString();
      dispatch(addMessage({
        id: aiMessageId,
        text: response.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        category: response.category,
        context: {
          ...context,
          confidence: response.confidence,
          relatedTopics: response.relatedTopics
        }
      }));

      // Submit for learning
      await aiLearningService.submitLearningData({
        query: text,
        response: response.message,
        feedback: {
          isHelpful: true, // Default value, will be updated with user feedback
          category: response.category,
          context: context
        }
      });

    } catch (error) {
      dispatch(setError('Failed to get AI response'));
      console.error('Chat Error:', error);
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return { sendMessage, isLoading };
};