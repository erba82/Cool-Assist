/**
 * ApiService using axios.
 */

import axiosModule from 'axios';
const axios = axiosModule; // استفاده امن از axios

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class ApiService {
  private static instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  public static async get<T = any>(url: string, config?: Record<string, any>) {
    return ApiService.instance.get<T>(url, config);
  }

  public static async post<T = any>(url: string, data?: any, config?: Record<string, any>) {
    return ApiService.instance.post<T>(url, data, config);
  }

  // سایر متدها در صورت نیاز
}

export const aiApi = {
  sendMessage: async (message: string) => {
    try {
      const response = await ApiService.post('/api/chat', { message });
      return response.data;
    } catch (error) {
      console.error('AI API Error:', error);
      throw error;
    }
  },
  getKnowledgeBase: async (topic: string) => {
    try {
      const response = await ApiService.get('/api/knowledge', {
        params: { topic }
      });
      return response.data;
    } catch (error) {
      console.error('Knowledge Base Error:', error);
      throw error;
    }
  }
};

export { ApiService };