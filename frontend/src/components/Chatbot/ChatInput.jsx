import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, HourglassIcon } from './ChatbotIcons';

export default function ChatInput({ onSend, disabled = false }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chatbot-input-form">
      <textarea
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Shift+Enter for new line)"
        disabled={disabled}
        className="chatbot-input"
        rows="2"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="send-button"
        title="Send message"
      >
        {disabled ? <HourglassIcon className="chatbot-btn-icon" /> : <SendIcon className="chatbot-btn-icon" />}
      </button>
    </form>
  );
}
