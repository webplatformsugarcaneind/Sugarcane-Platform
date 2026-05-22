import { useState, useCallback, useEffect } from 'react';
import { chatbotService } from '../services/chatbotService';
import { getStoredUser, getStoredToken } from '../utils/authSession';

// Generate unique session ID
function generateSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useChatbot(isPublic = false) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        
        // Load chat history from localStorage
        const savedMessages = localStorage.getItem(`chat_${newSessionId}`);
        if (savedMessages) {
          setMessages(JSON.parse(savedMessages));
        }
      } catch (err) {
        console.error('Session init error:', err);
      }
    };

    initSession();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    setError(null);
    
    // Add user message immediately
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    setLoading(true);

    try {
      // Get user context (if authenticated)
      const user = !isPublic ? getStoredUser() : null;
      const token = !isPublic ? getStoredToken() : null;

      // Build context
      const context = {
        sessionId,
        user: user ? {
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email
        } : null,
        isPublic
      };

      // Send to backend
      const response = await chatbotService.sendMessage(
        userMessage,
        context,
        token
      );

      // Add bot response
      const botMsg = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: response.response || response.content,
        timestamp: new Date().toISOString(),
        tokens: response.tokens,
        feedback: null
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = err.message || 'Failed to send message. Please try again.';
      setError(errorMessage);
      
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [sessionId, isPublic]);

  const clearHistory = useCallback(async () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      try {
        const token = !isPublic ? getStoredToken() : null;
        await chatbotService.clearHistory(sessionId, token);
        setMessages([]);
        localStorage.removeItem(`chat_${sessionId}`);
      } catch (err) {
        console.error('Error clearing history:', err);
      }
    }
  }, [sessionId, isPublic]);

  const submitFeedback = useCallback(async (messageId, rating) => {
    try {
      const token = !isPublic ? getStoredToken() : null;
      await chatbotService.submitFeedback(messageId, rating, token);
      
      // Update message feedback in state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, feedback: { rating } } : msg
      ));
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  }, [isPublic]);

  return {
    messages,
    loading,
    error,
    sessionId,
    sendMessage,
    clearHistory,
    submitFeedback
  };
}
