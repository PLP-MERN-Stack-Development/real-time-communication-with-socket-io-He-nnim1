import React, { useState } from 'react';
import { ChatProvider } from './context/ChatContext';
import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';


export default function App() {
  const [username, setUsername] = useState(null); 

  if (!username) {
    return <AuthPage setUsername={setUsername} />;
  }

  return (
    <ChatProvider username={username}>
      <ChatPage />
    </ChatProvider>
  );
}