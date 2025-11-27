import { useState } from 'react';
import { useChat } from '../hooks/useChat';


export const UserList = () => {
  const { users, isConnected, currentUsername, sendPrivateMessage } = useChat();
  const [dmTarget, setDmTarget] = useState(null);
  const [dmInput, setDmInput] = useState('');

  return (
    <div className="w-full md:w-64 bg-white border-l border-gray-200 p-4 flex flex-col shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-indigo-600 border-b pb-2">
        Active Users ({users.length})
      </h2>
      <div className="flex items-center mb-4 text-sm font-medium">
        <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1">
        {users.map((user, index) => (
          <div
            key={index}
            className={`flex flex-col p-2 rounded-lg transition duration-150 ${user.username === currentUsername ? 'bg-indigo-100 font-bold shadow-sm' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center w-full">
              <div className={`h-2 w-2 rounded-full mr-3 ${user.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-gray-700 truncate flex-1">
                {user.username} {user.username === currentUsername && '(You)'}
              </span>

              {/* DM button (hide for current user) */}
              {user.username !== currentUsername && (
                <button
                  onClick={() => {
                    setDmTarget(dmTarget === user.username ? null : user.username);
                    setDmInput('');
                  }}
                  className="ml-2 text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100 hover:bg-indigo-100"
                >
                  {dmTarget === user.username ? 'Cancel' : 'DM'}
                </button>
              )}
            </div>

            {/* DM input shown when this user is selected */}
            {dmTarget === user.username && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (dmInput.trim()) {
                    sendPrivateMessage(user.username, dmInput.trim());
                    setDmInput('');
                    setDmTarget(null);
                  }
                }}
                className="mt-2 flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={dmInput}
                  onChange={(e) => setDmInput(e.target.value)}
                  placeholder={`Message @${user.username}`}
                  className="flex-1 p-2 border rounded-md text-sm"
                  autoFocus
                />
                <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Send</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};