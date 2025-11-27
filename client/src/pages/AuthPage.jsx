import { useState } from 'react';


export const AuthPage = ({ setUsername }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setUsername(input.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm transform hover:scale-[1.01] transition duration-300">
        <h1 className="text-4xl font-extrabold mb-4 text-center text-indigo-700">Real-Time Chat</h1>
        <p className="text-gray-500 mb-8 text-center">Enter your username to begin chatting.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your Username"
            className="w-full p-4 border-2 border-indigo-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-lg shadow-md"
            required
            minLength={3}
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-150 shadow-xl shadow-indigo-500/50 transform hover:translate-y-[-2px]"
          >
            Enter Chat
          </button>
        </form>
      </div>
    </div>
  );
};