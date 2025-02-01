import axios from 'axios';

interface LearningData {
  query: string;
  response: string;
  feedback: {
    isHelpful: boolean;
    correction?: string;
    category: string;
    context: {
      calculationType?: string;
      systemType?: string;
      parameters?: Record<string, any>;
    }
  };
}

export const aiLearningService = {
  submitLearningData: async (data: LearningData) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/learning`, data);
    } catch (error) {
      console.error('Learning submission error:', error);
    }
  },

  feedbackSubmission: async (messageId: string, feedback: LearningData['feedback']) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/feedback/${messageId}`, feedback);
    } catch (error) {
      console.error('Feedback submission error:', error);
    }
  }
};