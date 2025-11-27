import { useState } from 'react';
import { MessageInput } from '../components/MessageInput';
import { MessageList } from '../components/MessageList';
import { UserList } from '../components/UserList';
import { TypingIndicator } from '../components/TypingIndicator';
import { useChat } from '../hooks/useChat';


export const ChatPage = () => {
  const { unreadCount, currentRoom, joinRoom } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [rooms] = useState(['global', 'general', 'random', 'tech']);

  return (
    <div className="flex h-screen antialiased text-gray-800 bg-gray-100">
      <div className="flex flex-row h-full w-full overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex flex-col flex-auto h-full p-4 md:p-6">
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-3xl bg-white h-full shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex flex-row items-center justify-between h-16 w-full p-4 border-b border-gray-200 bg-indigo-50">
              <div className="flex items-center">
                <div className="ml-2 font-extrabold text-2xl text-indigo-700">#{currentRoom}</div>
                {unreadCount > 0 && (
                  <span className="ml-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Search button */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                🔍 Search
              </button>
            </div>

            {/* Room selector */}
            <div className="flex overflow-x-auto px-4 py-2 bg-gray-100 border-b border-gray-200 space-x-2">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => joinRoom(room)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition ${
                    currentRoom === room
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  #{room}
                </button>
              ))}
            </div>

            {/* Search bar */}
            {showSearch && (
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            {/* Messages and Input */}
            <div className="flex flex-col h-full">
              <MessageList searchQuery={searchQuery} />
              <TypingIndicator />
              <MessageInput />
            </div>
          </div>
        </div>

        {/* User List Sidebar (Hidden on small screens) */}
        <div className="hidden md:flex">
            <UserList />
        </div>
      </div>
    </div>
  );
};