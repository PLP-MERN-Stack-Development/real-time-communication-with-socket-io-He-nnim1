import { useChat } from '../hooks/useChat';


export const TypingIndicator = () => {
  const { typingUsers } = useChat();

  if (typingUsers.length === 0) return null;

  const names = typingUsers.map(u => u.username);
  let indicatorText;

  if (names.length === 1) {
    indicatorText = `${names[0]} is typing...`;
  } else if (names.length === 2) {
    indicatorText = `${names[0]} and ${names[1]} are typing...`;
  } else {
    indicatorText = 'Multiple users are typing...';
  }

  return (
    <div className="text-sm italic text-gray-500 p-2 border-t border-gray-100 bg-gray-50 h-8 flex items-center">
      {indicatorText}
    </div>
  );
};