import { createContext } from 'react';
import { useSocket } from '../hooks/useSocket';

// Create the context
export const ChatContext = createContext(null);


export const ChatProvider = ({ children, username }) => {
  const chatState = useSocket(username);

  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
};