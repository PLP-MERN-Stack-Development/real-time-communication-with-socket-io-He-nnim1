import { useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});


export const useSocket = (username) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('global');
  // Use a ref to ensure the username is current inside event handlers
  const userRef = useRef(username);

  useEffect(() => {
    userRef.current = username;
  }, [username]);

  // Connect to socket server
  const connect = useCallback(() => {
    if (!socket.connected && userRef.current) {
      socket.connect();
    } else if (userRef.current && socket.connected) {
      // If already connected, just join
      socket.emit('user_join', userRef.current);
    }
  }, []);

  // Disconnect from socket server
  const disconnect = useCallback(() => {
    socket.disconnect();
  }, []);

  // Send a general message
  const sendMessage = useCallback((message, image = null) => {
    if (socket.connected) {
      socket.emit('send_message', { message, image, room: currentRoom });
    }
  }, [currentRoom]);

  // Send a private message to a specific username
  const sendPrivateMessage = useCallback((toUsername, message) => {
    if (socket.connected && toUsername && message && message.toString().trim()) {
      socket.emit('private_message', { to: toUsername, message: message.toString().trim() });
    }
  }, []);

  // Set typing status
  const setTyping = useCallback((isTyping) => {
    if (socket.connected) {
      socket.emit('typing', isTyping);
    }
  }, []);

  // Join a room
  const joinRoom = useCallback((room) => {
    if (socket.connected) {
      socket.emit('join_room', room);
      setCurrentRoom(room);
      setUnreadCount(0);
    }
  }, []);

  // Search messages
  const searchMessages = useCallback(async (query, room = 'global') => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/messages/search?q=${encodeURIComponent(query)}&room=${encodeURIComponent(room)}`);
      if (res.ok) return await res.json();
      return [];
    } catch (err) {
      console.error('Error searching messages', err.message || err);
      return [];
    }
  }, []);

  // Play a short notification sound (Web Audio)
  const playSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 600;
      g.gain.value = 0.02;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 150);
    } catch (e) {
      // ignore if audio not available
    }
  }, []);

  // --- Socket Event Listeners Setup ---
  useEffect(() => {
    const onConnect = async () => {
      setIsConnected(true);
      if (userRef.current) {
        socket.emit('user_join', userRef.current);
      }

      // Fetch recent history for the 'global' room on connect
      try {
        const res = await fetch(`${SOCKET_URL}/api/messages/history?room=global&limit=50&skip=0`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
        }
      } catch (err) {
        console.error('Error fetching initial history', err.message || err);
      }

      // Ask for notification permission silently
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.sender !== userRef.current) {
        setUnreadCount((prev) => prev + 1);
        if (document.hidden) {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try { new Notification(`New message from ${message.sender}`, { body: message.message || message.content }); } catch (e) {}
          }
        }
        playSound();
      }
    };

    const onPrivateMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.sender !== userRef.current) {
        playSound();
        if (document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try { new Notification(`DM from ${message.sender}`, { body: message.message || message.content }); } catch (e) {}
        }
      }
    };

    const onMessageDelivered = ({ id, timestamp }) => {
      setMessages((prev) => prev.map(m => (m.id === id || m._id === id ? { ...m, delivered: true, deliveredAt: timestamp } : m)));
    };

    const onReactUpdate = (payload) => {
      setMessages((prev) => prev.map(m => (m.id === payload.id || String(m._id) === String(payload.id) ? { ...m, reactions: payload.reactions } : m)));
    };

    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          username: user.username,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          username: user.username,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onTypingUsers = (list) => {
      // Filter out the current user from the typing list
      setTypingUsers(list.filter(u => u.username !== userRef.current));
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('message_delivered', onMessageDelivered);
    socket.on('react_update', onReactUpdate);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);

    // Initial connection attempt if username is set
    if (userRef.current) {
      connect();
    }

    // Clean up
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('message_delivered', onMessageDelivered);
      socket.off('react_update', onReactUpdate);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.disconnect(); 
    };
  }, [connect, playSound]);

  return {
    socket,
    isConnected,
    messages,
    users,
    typingUsers,
    unreadCount,
    currentRoom,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    joinRoom,
    searchMessages,
    currentUsername: userRef.current,
  };
};