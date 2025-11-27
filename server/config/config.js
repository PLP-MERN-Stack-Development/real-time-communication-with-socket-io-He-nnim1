const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/mern_chat_db',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173', // Your React client URL
};