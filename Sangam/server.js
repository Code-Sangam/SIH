require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();

const app = express();
let PORT = Number(process.env.PORT) || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static frontend
app.use(express.static(path.join(__dirname)));

// MongoDB setup
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/alumni_platform';
mongoose.set('strictQuery', false);
mongoose.connect(mongoUri).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error:', err.message));

const userSchema = new mongoose.Schema({
  userType: { type: String, enum: ['student', 'alumni'], required: true },
  fullName: String,
  rollNo: String,
  collegeName: String,
  department: String, // student only
  currentRole: String, // alumni only
  address: String,
  email: String,
  mobile: String,
  password: String, // simple placeholder
  avatar: String, // profile picture URL
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Chat schemas
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageTime: { type: Date, default: Date.now },
  unreadCount: { type: Map, of: Number, default: new Map() },
  createdAt: { type: Date, default: Date.now }
});
const Conversation = mongoose.model('Conversation', conversationSchema);

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  attachments: [{ url: String, filename: String, size: Number }],
  reactions: [{ userId: mongoose.Schema.Types.ObjectId, emoji: String }],
  readBy: [{ userId: mongoose.Schema.Types.ObjectId, readAt: Date }],
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'auth.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userType TEXT NOT NULL,
    fullName TEXT,
    rollNo TEXT,
    collegeName TEXT,
    department TEXT,
    currentRole TEXT,
    address TEXT,
    email TEXT,
    mobile TEXT,
    password TEXT,
    createdAt TEXT
  )`);
});

function insertSqlite(user){
  db.run(
    `INSERT INTO users (userType, fullName, rollNo, collegeName, department, currentRole, address, email, mobile, password, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.userType, user.fullName, user.rollNo, user.collegeName, user.department || null, user.currentRole || null, user.address, user.email || null, user.mobile || null, user.password || null, new Date().toISOString()],
    err => { if (err) console.error('SQLite insert error:', err.message); }
  );
}

// Helpers
function requireContact(req, res){
  if(!req.body.email && !req.body.mobile){
    res.status(400).json({ success:false, message: 'Provide email or mobile' });
    return false;
  }
  return true;
}

// Routes
app.post('/api/signup/student', async (req, res) => {
  try {
    if(!requireContact(req, res)) return;
    const { fullName, rollNo, collegeName, department, address, email, mobile } = req.body;
    const doc = await User.create({ userType: 'student', fullName, rollNo, collegeName, department, address, email, mobile });
    insertSqlite(doc.toObject());
    res.json({ success:true, message:'Student signup stored' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

app.post('/api/signup/alumni', async (req, res) => {
  try {
    if(!requireContact(req, res)) return;
    const { fullName, rollNo, collegeName, currentRole, address, email, mobile } = req.body;
    const doc = await User.create({ userType: 'alumni', fullName, rollNo, collegeName, currentRole, address, email, mobile });
    insertSqlite(doc.toObject());
    res.json({ success:true, message:'Alumni signup stored' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, mobile, password } = req.body;
    if(!email && !mobile) return res.status(400).json({ success:false, message:'Provide email or mobile' });
    const user = await User.findOne({ $or: [ { email }, { mobile } ] }).lean();
    if(!user) return res.status(401).json({ success:false, message:'User not found' });
    // Password is optional in this demo; accept login if user exists
    res.json({ success:true, message:'Login success', user: user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, message:'Server error' });
  }
});

// Chat API endpoints
app.get('/api/chat/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'fullName avatar isOnline lastSeen')
      .populate('lastMessage')
      .sort({ lastMessageTime: -1 });
    
    res.json({ success: true, conversations });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/chat/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({ conversationId })
      .populate('senderId', 'fullName avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({ success: true, messages: messages.reverse() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/chat/send-message', async (req, res) => {
  try {
    const { conversationId, senderId, content, messageType = 'text', replyTo } = req.body;
    
    // Create new message
    const message = new Message({
      conversationId,
      senderId,
      content,
      messageType,
      replyTo
    });
    
    await message.save();
    
    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageTime: new Date(),
      $inc: { [`unreadCount.${senderId}`]: 0 } // Reset sender's unread count
    });
    
    // Populate message for response
    await message.populate('senderId', 'fullName avatar');
    if (replyTo) await message.populate('replyTo');
    
    res.json({ success: true, message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/chat/create-conversation', async (req, res) => {
  try {
    const { participants } = req.body;
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: participants }
    }).populate('participants', 'fullName avatar isOnline lastSeen');
    
    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
      await conversation.populate('participants', 'fullName avatar isOnline lastSeen');
    }
    
    res.json({ success: true, conversation });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/chat/mark-read', async (req, res) => {
  try {
    const { conversationId, userId } = req.body;
    
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: { [`unreadCount.${userId}`]: 0 }
    });
    
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/users/search', async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('fullName email avatar isOnline lastSeen userType');
    
    res.json({ success: true, users });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server with automatic port fallback if in use
function start(port, attemptsLeft){
  const server = app.listen(port, () => {
    const actualPort = server.address().port;
    console.log(`Server running on http://localhost:${actualPort}`);
  });

  server.on('error', (err) => {
    if(err && err.code === 'EADDRINUSE' && attemptsLeft > 0){
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, trying ${nextPort}...`);
      setTimeout(() => start(nextPort, attemptsLeft - 1), 250);
    } else {
      console.error('Failed to start server:', err && err.message ? err.message : err);
      process.exit(1);
    }
  });
}

start(PORT, 20);
