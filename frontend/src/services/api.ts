import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const aiApi = {
  sendMessage: async (message: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, { message });
      return response.data;
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  },

  getKnowledgeBase: async (topic: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/knowledge`, {
        params: { topic }
      });
      return response.data;
    } catch (error) {
      console.error('Knowledge Base Error:', error);
      throw error;
    }
  }
};