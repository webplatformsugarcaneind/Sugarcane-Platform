import React from 'react';
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon } from './ChatbotIcons';

export default function ChatMessage({ message, onFeedback }) {
  const isUser = message.role === 'user';
  const isTyping = message.role === 'system' && message.content === 'typing';

  if (isTyping) {
    return (
      <div className="chatbot-message assistant">
        <div className="chatbot-message-content">
          <div className="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`chatbot-message ${isUser ? 'user' : 'assistant'}`}>
      <div className="chatbot-message-content">
        <div className="message-text" style={{ color: '#ffffff', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </div>

        {!isUser && (
          <div className="message-actions">
            <button
              className="feedback-btn"
              onClick={() => onFeedback?.(message.id, 1)}
              title="Helpful"
              aria-label="Mark as helpful"
              disabled={message.feedback?.rating === 1}
            >
              <ThumbsUpIcon className="chatbot-action-icon" />
            </button>
            <button
              className="feedback-btn"
              onClick={() => onFeedback?.(message.id, 0)}
              title="Not helpful"
              aria-label="Mark as not helpful"
              disabled={message.feedback?.rating === 0}
            >
              <ThumbsDownIcon className="chatbot-action-icon" />
            </button>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(message.content);
              }}
              title="Copy message"
              aria-label="Copy message"
            >
              <CopyIcon className="chatbot-action-icon" />
            </button>
          </div>
        )}
      </div>
      <div className="message-timestamp">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
}