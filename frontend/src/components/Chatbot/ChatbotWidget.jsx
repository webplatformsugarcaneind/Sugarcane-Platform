import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import ChatPanel from './ChatPanel';
import { ChatBubbleIcon } from './ChatbotIcons';

export default function ChatbotWidget({ isPublic = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (isPublic) {
    if (location && location.pathname !== '/') return null;
  }

  const portalContent = (
    <>
      {isOpen && (
        <div className="chatbot-modal-overlay">
          <ChatPanel
            onClose={() => setIsOpen(false)}
            isPublic={isPublic}
          />
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-floating-button"
          title="Open chat"
          aria-label="Chat with us"
        >
          <ChatBubbleIcon className="chat-icon" />
          <span className="pulse"></span>
        </button>
      )}
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(portalContent, document.body);
  }

  return portalContent;
}