const Message = require('../models/Message');

const getMessageHistory = async (req, res) => {
  try {
    
    const { room = 'global', limit = 50, skip = 0 } = req.query;

    const query = { isPrivate: false };
    if (room && room !== 'global') query.room = room;

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip, 10) || 0)
      .limit(parseInt(limit, 10) || 50)
      .select('sender content timestamp room image reactions')
      .lean();

    // Reverse to show oldest first
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching message history:', error.message);
    res.status(500).json({ message: 'Server error retrieving messages' });
  }
};


const searchMessages = async (req, res) => {
  try {
    const { q = '', room = 'global' } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const query = {
      isPrivate: false,
      content: { $regex: q, $options: 'i' },
    };
    if (room && room !== 'global') query.room = room;

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(50)
      .select('sender content timestamp room image reactions')
      .lean();

    res.json(messages.reverse());
  } catch (error) {
    console.error('Error searching messages:', error.message);
    res.status(500).json({ message: 'Server error searching messages' });
  }
};

module.exports = {
  getMessageHistory,
  searchMessages,
};