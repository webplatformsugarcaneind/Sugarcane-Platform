import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class ChatbotService {
  async sendMessage(message, context, token) {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.post(
        `${API_BASE_URL}/api/chatbot/send-message`,
        {
          message,
          context,
          sessionId: context.sessionId,
          isPublic: context.isPublic
        },
        config
      );

      return response.data;

    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'Failed to send message. Please try again.';
      throw new Error(errorMessage);
    }
  }

  async getHistory(sessionId, token) {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.get(
        `${API_BASE_URL}/api/chatbot/history/${sessionId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      return { messages: [] };
    }
  }

  async submitFeedback(messageId, rating, token) {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.post(
        `${API_BASE_URL}/api/chatbot/feedback`,
        { messageId, rating },
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }

  async clearHistory(sessionId, token) {
    try {
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {};

      const response = await axios.delete(
        `${API_BASE_URL}/api/chatbot/sessions/${sessionId}`,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
}

export const chatbotService = new ChatbotService();
