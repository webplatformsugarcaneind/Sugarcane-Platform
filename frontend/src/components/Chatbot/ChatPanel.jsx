import React, { useEffect, useRef, useState } from 'react';
import { useChatbot } from '../../hooks/useChatbot';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { EmptyChatIcon, TrashIcon, CloseIcon, WarningIcon } from './ChatbotIcons';
import ConfirmModal from './ConfirmModal';

export default function ChatPanel({ onClose, isPublic = false }) {
  const {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    submitFeedback
  } = useChatbot(isPublic);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="chatbot-panel-container">
      <div className="chatbot-header">
        <div className="header-title">
          <h2><EmptyChatIcon className="chatbot-header-icon" /> CaneSetu Assistant</h2>
          <p>Your AI-powered sugarcane platform helper</p>
        </div>
        <div className="header-actions">
          {messages.length > 0 && (
            <button
                onClick={() => setConfirmOpen(true)}
              className="header-btn"
              title="Clear chat"
              aria-label="Clear chat"
            >
              <TrashIcon className="chatbot-header-icon" />
            </button>
          )}
          <button
            onClick={onClose}
            className="header-btn close-btn"
            title="Close"
            aria-label="Close chat"
          >
            <CloseIcon className="chatbot-header-icon" />
          </button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">
              <EmptyChatIcon className="chatbot-empty-icon" />
            </div>
            <h3>Start a Conversation</h3>
            <p>Ask me anything about {isPublic ? 'the platform' : 'your account and operations'}!</p>
            <div className="example-prompts">
              {isPublic ? (
                <>
                  <button onClick={() => sendMessage('What is CaneSetu?')}>What is CaneSetu?</button>
                  <button onClick={() => sendMessage('How do I get started?')}>How do I get started?</button>
                  <button onClick={() => sendMessage('What are the fees?')}>What are the fees?</button>
                </>
              ) : (
                <>
                  <button onClick={() => sendMessage('Help me manage my contracts')}>Help me manage my contracts</button>
                  <button onClick={() => sendMessage('What are current market prices?')}>Current market prices?</button>
                  <button onClick={() => sendMessage('Show me my recent activity')}>Show me my recent activity</button>
                </>
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onFeedback={submitFeedback}
          />
        ))}

        {error && (
          <div className="error-message">
            <div className="error-icon">
              <WarningIcon className="chatbot-error-icon" />
            </div>
            <div className="error-text">
              <p><strong>Oops!</strong> {error}</p>
              <button onClick={() => sendMessage('Try again')}>Try Again</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="chatbot-message assistant">
            <div className="chatbot-message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={sendMessage}
        disabled={loading}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Clear chat history"
        message="Are you sure you want to clear the chat history? This cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          await clearHistory();
        }}
        confirmLabel="Clear"
        cancelLabel="Cancel"
      />
    </div>
  );
}