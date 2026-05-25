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

  const clientFallback = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('contract')) return 'To manage your contracts, go to your Dashboard and click on the Contracts tab. You can view, accept, or reject contract offers there.';
    if (lower.includes('price') || lower.includes('market')) return 'Current sugarcane prices vary by region. Check the Marketplace section for live listings and prices from buyers near you.';
    if (lower.includes('activity') || lower.includes('recent')) return 'Your recent activity is shown on your Dashboard — including contract updates, new listings, and notifications.';
    if (lower.includes('hhm') || lower.includes('harvest')) return 'HHMs (Harvest Managers) coordinate between farmers and factories. You can find them in the HHM Directory under your navigation menu.';
    if (lower.includes('factory') || lower.includes('factories')) return 'Browse available factories in the Factory Directory. You can compare prices, payment terms, and ratings using the Factory Analysis page.';
    if (lower.includes('marketplace')) return 'The Marketplace lets you list your sugarcane or browse existing listings. Navigate to Marketplace from the top menu.';
    if (lower.includes('profile')) return 'Update your profile from the Profile section in the top navigation. Keep your details current for better matches.';
    if (lower.includes('hello') || lower.includes('hi')) return 'Hello! I am the CaneSetu Assistant. Ask me about contracts, the marketplace, factories, HHMs, or anything about the platform!';
    return 'I can help you with contracts, marketplace listings, factory analysis, HHM management, and more. What would you like to know?';
  };

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

      // Check if it's a network/server error — use client-side fallback instead of showing an error
      const isNetworkError = !err.response || err.response?.status === 404 || err.response?.status === 503;
      
      if (isNetworkError) {
        // Use client-side fallback silently
        const fallbackContent = clientFallback(userMessage);
        const fallbackMsg = {
          id: `msg_${Date.now() + 1}`,
          role: 'assistant',
          content: fallbackContent,
          timestamp: new Date().toISOString(),
          tokens: null,
          feedback: null
        };
        setMessages(prev => [...prev, fallbackMsg]);
      } else {
        // Show error only for genuine failures (e.g. rate limit, auth error)
        const errorMessage = err.response?.data?.message || 'Something went wrong. Please try again.';
        setError(errorMessage);
        // Remove the user message if there was an error
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setLoading(false);
    }
  }, [sessionId, isPublic]);

  const clearHistory = useCallback(async () => {
    try {
      const token = !isPublic ? getStoredToken() : null;
      await chatbotService.clearHistory(sessionId, token);
      setMessages([]);
      localStorage.removeItem(`chat_${sessionId}`);
    } catch (err) {
      console.error('Error clearing history:', err);
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
