/**
 * server.js (Refactored Main Server File)
 * Initializes Express, connects to MongoDB, sets up Socket.IO, and defines routes.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Internal Modules
const config = require('./config/config');
const connectDB = require('./config/db');
const handleSocketEvents = require('./socket/socketHandler');
const messageController = require('./controllers/messageController');

// --- 1. Database Connection ---
connectDB();

// --- 2. Initialize App and Server ---
const app = express();
const server = http.createServer(app);

// --- 3. Initialize Socket.IO ---
const io = new Server(server, {
  cors: {
    origin: config.CLIENT_URL, // Allow requests from your React client
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// --- 4. Middleware ---
app.use(cors({ origin: config.CLIENT_URL }));
app.use(express.json());

// --- 5. API Routes ---
// GET /api/messages/history - Retrieves the last 100 global messages
app.get('/api/messages/history', messageController.getMessageHistory);

// GET /api/messages/search - Search messages by content
app.get('/api/messages/search', messageController.searchMessages);

app.get('/', (req, res) => {
  res.send('MERN Chat Server is running and connected to MongoDB.');
});

// --- 6. Socket.IO Connection Handler ---
io.on('connection', (socket) => {
  handleSocketEvents(io, socket);
});

// --- 7. Start Server ---
server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});