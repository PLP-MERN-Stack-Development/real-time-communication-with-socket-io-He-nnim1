const { userJoin, userLeave, getActiveUsers, getUserBySocketId } = require('../utils/userManager');
const Message = require('../models/Message');
const User = require('../models/User');


const typingUsers = new Map();


const handleSocketEvents = (io, socket) => {
  console.log(`User connected: ${socket.id}`);

  // --- 1. USER JOIN ---
  socket.on('user_join', async (username) => {
    if (!username || username.length < 3) {
        return socket.disconnect(true);
    }
    
    // Use the utility function to manage user state
    const user = await userJoin(username, socket.id);
    
    // Emit updates
    io.emit('user_list', getActiveUsers());
    io.emit('user_joined', user); // Notify everyone a user joined
    console.log(`${user.username} joined the chat with ID ${socket.id}`);
  });

  // --- 2. SEND MESSAGE ---
  // Supports: { message, room, image }
  socket.on('send_message', async (payload = {}) => {
    const { message, room, image } = payload;
    const sender = getUserBySocketId(socket.id);
    if (!sender || !message || !message.toString().trim()) return;

    const messageData = {
      sender: sender.username,
      content: message.toString().trim(),
      room: room || 'global',
      image: image || null,
      timestamp: new Date(),
    };

    try {
      // Save message to database
      const newMessage = new Message(messageData);
      await newMessage.save();

      // Broadcast to room or everyone
      if (messageData.room && messageData.room !== 'global') {
        io.to(messageData.room).emit('receive_message', {
          ...messageData,
          id: newMessage._id,
          message: messageData.content,
          senderId: socket.id,
        });
      } else {
        io.emit('receive_message', {
          ...messageData,
          id: newMessage._id,
          message: messageData.content,
          senderId: socket.id,
        });
      }

      // Send delivery acknowledgment to sender
      socket.emit('message_delivered', { id: newMessage._id, timestamp: newMessage.timestamp });

    } catch (error) {
      console.error('Error saving message:', error.message);
    }

    // Clear typing status after sending a message
    if (typingUsers.has(socket.id)) {
      typingUsers.delete(socket.id);
      io.emit('typing_users', Array.from(typingUsers.values()));
    }
  });

  // --- 3. PRIVATE MESSAGE (Optional/Advanced feature) ---
  socket.on('private_message', async (payload = {}) => {
    // Accept multiple possible keys from different client implementations
    const { toUsername, to, recipient, message } = payload;
    const recipientUsername = toUsername || to || recipient;

    const sender = getUserBySocketId(socket.id);
    if (!sender || !message || !message.toString().trim() || !recipientUsername) return;

    try {
      // Find recipient by username and ensure they're online
      const recipientUser = await User.findOne({ username: recipientUsername, online: true });

      if (!recipientUser || !recipientUser.socketId) {
        // Notify sender that the user is not online
        return socket.emit('system_message', `User ${recipientUsername} is not currently online.`);
      }

      const messageData = {
        sender: sender.username,
        recipient: recipientUsername,
        content: message.toString().trim(),
        timestamp: new Date(),
        isPrivate: true,
      };

      // Save private message to database
      const newMessage = new Message(messageData);
      await newMessage.save();

      const clientPayload = {
        ...messageData,
        message: messageData.content,
        senderId: socket.id,
      };

      // Send to recipient and back to sender for local display
      socket.to(recipientUser.socketId).emit('private_message', clientPayload);
      socket.emit('private_message', clientPayload);
    } catch (error) {
      console.error('Error handling private message:', error.message);
    }
  });

  // --- 4. TYPING INDICATOR ---
  socket.on('typing', (isTyping) => {
    const user = getUserBySocketId(socket.id);
    if (!user) return;
    
    if (isTyping) {
      typingUsers.set(socket.id, { username: user.username, id: socket.id });
    } else {
      typingUsers.delete(socket.id);
    }
    
    // Emit the list of unique usernames currently typing
    io.emit('typing_users', Array.from(typingUsers.values()));
  });

  // --- 4b. ROOM JOIN/LEAVE ---
  socket.on('join_room', (room) => {
    if (!room) return;
    socket.join(room);
    io.to(room).emit('system_message', `${socket.id} joined room ${room}`);
  });

  socket.on('leave_room', (room) => {
    if (!room) return;
    socket.leave(room);
    io.to(room).emit('system_message', `${socket.id} left room ${room}`);
  });

  // --- 4c. REACTIONS ---
  socket.on('react_message', async ({ messageId, reaction, username }) => {
    if (!messageId || !reaction) return;
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      // Toggle reaction for this user: remove if same reaction exists, otherwise add
      const existingIndex = msg.reactions.findIndex(r => r.username === username && r.reaction === reaction);
      if (existingIndex >= 0) {
        msg.reactions.splice(existingIndex, 1);
      } else {
        msg.reactions.push({ username, reaction });
      }

      await msg.save();

      // Emit reaction update to room or all
      const payload = { id: msg._id, reactions: msg.reactions };
      if (msg.room && msg.room !== 'global') {
        io.to(msg.room).emit('react_update', payload);
      } else {
        io.emit('react_update', payload);
      }
    } catch (err) {
      console.error('Error reacting to message:', err.message);
    }
  });

  // --- 5. DISCONNECT ---
  socket.on('disconnect', async () => {
    // Use utility function to update database and in-memory state
    const user = await userLeave(socket.id);
    
    if (user) {
      console.log(`${user.username} disconnected.`);
      io.emit('user_left', user);
      io.emit('user_list', getActiveUsers());
      
      // Remove from typing list and update clients
      if (typingUsers.has(socket.id)) {
        typingUsers.delete(socket.id);
        io.emit('typing_users', Array.from(typingUsers.values()));
      }
    }
  });
};

module.exports = handleSocketEvents;