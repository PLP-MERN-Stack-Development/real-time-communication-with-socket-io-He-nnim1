import { useState, useRef } from 'react';
import { useChat } from '../hooks/useChat';


export const MessageInput = () => {
  const { sendMessage, setTyping } = useChat();
  const [input, setInput] = useState('');
  const [fileData, setFileData] = useState(null);
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInput(text);

    // Logic for setting typing status
    if (text.length > 0 && !typingTimeoutRef.current) {
      setTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set a timeout to stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      typingTimeoutRef.current = null;
    }, 3000);
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (input.trim() || fileData) {
      sendMessage(input.trim() || '', fileData || null);
      setInput('');
      setFileData(null);
      
      // Clear typing status immediately after sending
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      setTyping(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSend} className="flex space-x-3 items-center">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-inner"
          autoFocus
        />
        <input type="file" accept="image/*" onChange={handleFile} className="text-sm" />
        <button
          type="submit"
          className="bg-indigo-600 text-white p-3 rounded-xl font-semibold hover:bg-indigo-700 transition duration-150 shadow-lg shadow-indigo-500/50 disabled:opacity-50 disabled:shadow-none"
          disabled={!input.trim() && !fileData}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};