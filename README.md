# 🔄 Real-Time Chat Application with Socket.io

A fully functional real-time chat application built with Node.js, Express, React, and Socket.io. This MERN stack application demonstrates bidirectional communication, advanced messaging features, and notifications.

## 🚀 Features Implemented

### Task 1: Project Setup ✅
- Node.js server with Express and Socket.io
- React front-end application with Vite
- Bi-directional Socket.io communication
- MongoDB database integration with Mongoose

### Task 2: Core Chat Functionality ✅
- **Username-based authentication**: Simple username input for joining chat
- **Global chat room**: All users can send and receive messages in real-time
- **Message display**: Each message shows sender name and timestamp
- **Typing indicators**: Real-time "X is typing..." indicator
- **Online/offline status**: Active users list with online status indicators

### Task 3: Advanced Chat Features ✅
- **Private messaging**: Direct messages between users with DM UI
- **Multiple chat rooms/channels**: Support for global, general, random, tech channels
- **User is typing indicator**: Real-time typing status
- **Image/file sharing**: Users can upload and share images inline
- **Read receipts**: Delivery acknowledgment for messages
- **Message reactions**: Users can react with emoji (👍)

### Task 4: Real-Time Notifications ✅
- **Message notifications**: Sound + browser notifications
- **Join/leave notifications**: System messages when users connect/disconnect
- **Unread message count**: Badge showing unread messages
- **Sound notifications**: 600Hz audio alert on new messages
- **Browser notifications**: Web Notifications API with permission request

### Task 5: Performance and UX Optimization ✅
- **Message pagination**: Load messages with skip/limit (50 per page)
- **Reconnection logic**: Auto-reconnect with 5 attempts, 1s delay
- **Socket.io rooms**: Separate message streams by room
- **Delivery acknowledgment**: Message confirmation from server
- **Message search**: Full-text search across messages
- **Responsive design**: Mobile-friendly with Tailwind CSS

## 📂 Project Structure

```
.
├── server/
│   ├── config/
│   │   ├── config.js           # Environment configuration
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   └── messageController.js# Message API endpoints
│   ├── models/
│   │   ├── Message.js          # Message schema with rooms, images, reactions
│   │   └── User.js             # User schema with socket tracking
│   ├── socket/
│   │   └── socketHandler.js    # Socket.io event handlers
│   ├── utils/
│   │   └── userManager.js      # User state management
│   ├── server.js               # Express server setup
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MessageInput.jsx    # Message input with file upload
│   │   │   ├── MessageList.jsx     # Message display with reactions
│   │   │   ├── TypingIndicator.jsx # Typing status display
│   │   │   └── UserList.jsx        # Online users with DM buttons
│   │   ├── context/
│   │   │   └── ChatContext.jsx     # Chat context provider
│   │   ├── hooks/
│   │   │   ├── useChat.jsx         # Chat context hook
│   │   │   └── useSocket.jsx       # Socket.io management
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        # Login page
│   │   │   └── ChatPage.jsx        # Main chat interface
│   │   ├── App.jsx                 # Root component
│   │   └── main.jsx                # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or cloud)
- npm or yarn

### Server Setup

```bash
cd server
npm install
```

Create `.env`:
```
MONGODB_URI=mongodb://localhost:27017/chat-app
PORT=5000
CLIENT_URL=http://localhost:5173
```

Start server:
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Client Setup

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173` (or next available port)

Optional `.env.local`:
```
VITE_SOCKET_URL=http://localhost:5000
```

## 🧪 Testing the Application

### Basic Chat Flow
1. Open two browser windows
2. Enter different usernames
3. Send messages in real-time
4. Both users receive messages instantly

### Testing Advanced Features

**Private Messaging:**
- Click "DM" button next to any user
- Type and send private message
- Message appears in main chat

**Image Sharing:**
- Select image file in message composer
- Image sends and displays inline for all users

**Room Switching:**
- Click room buttons: #global, #general, #random, #tech
- Message history loads for each room
- Unread count resets when you switch rooms

**Typing Indicator:**
- Start typing a message
- "X is typing..." appears for other users
- Stops after 3 seconds of inactivity

**Message Reactions:**
- Click 👍 button on any message
- Reaction updates for all connected users

**Search Messages:**
- Click 🔍 Search button
- Type search term (min 2 characters)
- Messages filter in real-time

**Notifications:**
- Allow browser notifications when prompted
- When window is hidden and message arrives:
  - Sound plays (600Hz)
  - Browser notification shows

**Unread Count:**
- Header shows "X unread" badge
- Count increases when new messages arrive
- Resets when you focus the window

## 🔌 Socket.io Events

### Client → Server
| Event | Data | Description |
|-------|------|-------------|
| `user_join` | username | User joins chat |
| `send_message` | {message, image?, room?} | Send message |
| `private_message` | {to, message} | Send private message |
| `typing` | boolean | User typing status |
| `join_room` | room | Join specific room |
| `react_message` | {messageId, reaction, username} | React to message |

### Server → Client
| Event | Data | Description |
|-------|------|-------------|
| `receive_message` | message | New message |
| `private_message` | message | Private message |
| `message_delivered` | {id, timestamp} | Message confirmed |
| `react_update` | {id, reactions} | Reaction update |
| `user_list` | users[] | Active users |
| `user_joined` | user | User joined |
| `user_left` | user | User left |
| `typing_users` | users[] | Who's typing |

## 📡 REST API Endpoints

### GET `/api/messages/history`
Fetch message history with pagination

**Parameters:**
- `room` (default: 'global')
- `limit` (default: 50)
- `skip` (default: 0)

**Example:**
```
GET /api/messages/history?room=general&limit=50&skip=0
```

### GET `/api/messages/search`
Search messages by content

**Parameters:**
- `q` (required, min 2 chars)
- `room` (default: 'global')

**Example:**
```
GET /api/messages/search?q=hello&room=general
```

## 📊 Database Schemas

### User
```javascript
{
  username: String (unique),
  socketId: String (unique, sparse),
  online: Boolean,
  createdAt: Date
}
```

### Message
```javascript
{
  sender: String,
  content: String (max 500),
  room: String (default: 'global'),
  image: String (base64, optional),
  timestamp: Date,
  isPrivate: Boolean,
  recipient: String (if private),
  reactions: [{
    username: String,
    reaction: String
  }]
}
```

## 🎨 Technology Stack

**Backend:**
- Express.js - REST API
- Socket.io 4.x - Real-time communication
- MongoDB + Mongoose - Database
- CORS - Cross-origin requests
- dotenv - Environment variables

**Frontend:**
- React 18 - UI
- Vite - Build tool
- Socket.io-client - Socket.io client
- Tailwind CSS - Styling
- JavaScript ES6+

## 🚀 Deployment

### Server (Railway/Render)
1. Push to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Client (Vercel/Netlify)
1. Build: `npm run build`
2. Deploy `dist/` folder
3. Set `VITE_SOCKET_URL` environment variable

## ✅ All Requirements Fulfilled

- [x] **Task 1**: Express server, Socket.io, React client, connection
- [x] **Task 2**: Username auth, global room, messages, typing, online status
- [x] **Task 3**: Private messaging, rooms, typing, images, reactions, read receipts
- [x] **Task 4**: Message notifications, join/leave, unread count, sound, browser notifications
- [x] **Task 5**: Pagination, reconnection, rooms, delivery ack, search, responsive

---

**Built:** November 26, 2025 | **Version:** 1.0.0 | **Status:** Complete ✅ 