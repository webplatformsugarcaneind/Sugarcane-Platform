import React, { createContext, useReducer, useContext } from 'react';

export const ChatbotContext = createContext();

const initialState = {
  isOpen: false,
  unreadCount: 0,
  minimized: false
};

function chatbotReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_OPEN':
      return { ...state, isOpen: !state.isOpen };
    case 'SET_OPEN':
      return { ...state, isOpen: action.payload };
    case 'SET_MINIMIZED':
      return { ...state, minimized: action.payload };
    case 'INCREMENT_UNREAD':
      return { ...state, unreadCount: state.unreadCount + 1 };
    case 'RESET_UNREAD':
      return { ...state, unreadCount: 0 };
    default:
      return state;
  }
}

export function ChatbotProvider({ children }) {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);

  const toggleOpen = () => dispatch({ type: 'TOGGLE_OPEN' });
  const setOpen = (isOpen) => dispatch({ type: 'SET_OPEN', payload: isOpen });
  const setMinimized = (minimized) => dispatch({ type: 'SET_MINIMIZED', payload: minimized });
  const incrementUnread = () => dispatch({ type: 'INCREMENT_UNREAD' });
  const resetUnread = () => dispatch({ type: 'RESET_UNREAD' });

  return (
    <ChatbotContext.Provider value={{
      ...state,
      toggleOpen,
      setOpen,
      setMinimized,
      incrementUnread,
      resetUnread
    }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbotContext() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbotContext must be used within ChatbotProvider');
  }
  return context;
}
