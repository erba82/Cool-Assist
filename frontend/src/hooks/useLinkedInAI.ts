import { useState, useEffect } from 'react';
import { LinkedInAIService } from '../services/ai/LinkedInAIService';

interface AIPersonalization {
  // Add relevant properties based on your AI personalization data structure
  id?: string;
  preferences?: Record<string, any>;
  settings?: Record<string, any>;
}

export const useLinkedInAI = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [personalization, setPersonalization] = useState<AIPersonalization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAI = async () => {
      try {
        const accessToken = localStorage.getItem('linkedin_access_token');
        if (!accessToken) {
          throw new Error('LinkedIn access token not found');
        }

        const aiService = LinkedInAIService.getInstance();
        await aiService.initializeAILearning(accessToken);
        const personalizedSettings = await aiService.getPersonalization() as AIPersonalization;
        setPersonalization(personalizedSettings);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize AI');
      }
    };

    initializeAI();
  }, []);

  const updateAILearning = async (interaction: any) => {
    try {
      const aiService = LinkedInAIService.getInstance();
      await aiService.updateLearningFromInteraction(interaction);
      const updatedSettings = await aiService.getPersonalization() as AIPersonalization;
      setPersonalization(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update AI learning');
    }
  };

  return {
    isInitialized,
    personalization,
    error,
    updateAILearning
  };
};