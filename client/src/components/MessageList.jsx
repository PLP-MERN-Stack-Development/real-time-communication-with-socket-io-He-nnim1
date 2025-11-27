import { useRef, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';


export const MessageList = ({ searchQuery = '' }) => {
  const { messages, currentUsername, socket, searchMessages } = useChat();
  const [filteredMessages, setFilteredMessages] = useState(messages);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filterLocal = messages.filter(m =>
        (m.message || m.content || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filterLocal);
    } else {
      setFilteredMessages(messages);
    }
  }, [searchQuery, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [filteredMessages]);

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendReaction = (id, reaction) => {
    socket.emit('react_message', { messageId: id, reaction, username: currentUsername });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
      {filteredMessages.map((msg, index) => {
        const isSystem = msg.system;
        const isCurrentUser = msg.username === currentUsername;
        const bgColor = isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-white shadow-md text-gray-800';
        const alignment = isCurrentUser ? 'self-end' : 'self-start';
        const borderRadius = isCurrentUser ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl' : 'rounded-tl-xl rounded-tr-xl rounded-br-xl';
        const senderColor = isCurrentUser ? 'text-indigo-200' : 'text-indigo-600';

        if (isSystem) {
          return (
            <div key={index} className="flex justify-center w-full">
              <span className="text-xs italic text-gray-400 px-3 py-1 bg-gray-100 rounded-full shadow-inner">
                {msg.message}
              </span>
            </div>
          );
        }

        return (
          <div key={index} className={`flex flex-col max-w-xs md:max-w-md ${alignment}`}>
            <div className={`px-4 py-2 ${bgColor} ${borderRadius} flex flex-col transition duration-150`}>
              {!isCurrentUser && (
                <span className={`text-sm font-semibold mb-1 ${senderColor}`}>
                  {msg.username}
                </span>
              )}

              <p className="text-base break-words">
                {msg.message || msg.content}
              </p>

              {msg.image && (
                <img src={msg.image} alt="shared" className="mt-2 rounded-md max-h-60 object-contain" />
              )}

              {/* Reactions */}
              <div className="flex items-center mt-2 space-x-2">
                <button onClick={() => sendReaction(msg.id || msg._id, '👍')} className="text-sm px-2 py-1 bg-gray-100 rounded-md">👍</button>
                <div className="text-xs text-gray-500">
                  {(msg.reactions || []).length} reactions
                </div>

                {/* Delivered indicator for messages sent by current user */}
                {isCurrentUser && (
                  <div className="text-xs text-indigo-200 ml-2">
                    {msg.delivered ? 'Delivered' : 'Sending...'}
                  </div>
                )}
              </div>

              <span className={`text-xs mt-1 ${isCurrentUser ? 'text-indigo-300' : 'text-gray-400'} self-end`}>
                {formatTimestamp(msg.timestamp)}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};