const User = require('../models/User');

const activeUsers = new Map(); 

const userJoin = async (username, socketId) => {
  let user = await User.findOneAndUpdate(
    { username: username },
    { socketId: socketId, online: true },
    { new: true, upsert: true } // Creates if not found
  );

  activeUsers.set(socketId, { username: user.username, socketId: socketId });
  return { username: user.username, id: socketId };
};


const userLeave = async (socketId) => {
  const userInMemory = activeUsers.get(socketId);
  if (!userInMemory) return null;

  activeUsers.delete(socketId);
  
  const user = await User.findOneAndUpdate(
    { socketId: socketId },
    { socketId: null, online: false },
    { new: true }
  );
  
  return user ? { username: user.username, id: socketId } : null;
};


const getActiveUsers = () => {
  // Convert the Map values to an array for easy consumption
  return Array.from(activeUsers.values()).map(u => ({
    username: u.username,
    id: u.socketId,
    online: true,
  }));
};


const getUserBySocketId = (socketId) => {
    return activeUsers.get(socketId);
};

module.exports = {
  userJoin,
  userLeave,
  getActiveUsers,
  getUserBySocketId,
};