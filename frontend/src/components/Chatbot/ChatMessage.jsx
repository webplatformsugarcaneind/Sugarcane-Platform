import React, { useState, useEffect } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon, SpeakerIcon } from './ChatbotIcons';
import { speak, stop, isSpeaking } from './tts';

export default function ChatMessage({ message, onFeedback }) {
  const isUser = message.role === 'user';
  const isTyping = message.role === 'system' && message.content === 'typing';
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    // keep local speaking state in sync if speech status changed elsewhere
    if (!isSpeaking(message.id) && speaking) {
      setSpeaking(false);
    }
    // no dependencies on speaking to avoid re-subscribing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <button
              className={`speak-btn ${speaking ? 'active' : ''}`}
              onClick={() => {
                if (speaking) {
                  stop();
                  // onEnd will be called by stop()
                } else {
                  // stop any other speech and start this one
                  speak(message.content, message.id, () => setSpeaking(true), () => setSpeaking(false));
                }
              }}
              title="Read aloud"
              aria-label="Read message aloud"
            >
              <SpeakerIcon className="chatbot-action-icon" />
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