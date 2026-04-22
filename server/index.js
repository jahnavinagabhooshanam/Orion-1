require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(cors());

// Root Health Check (For Render monitoring)
app.get('/', (req, res) => {
  res.send('<h1>ORION BACKEND: ONLINE</h1><p>Neural Risk Intelligence Engine is active and monitoring vectors.</p>');
});

// Pass io to routes
apiRoutes.setIo(io);
app.use('/api', apiRoutes);

// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB Connected to backend');
}).catch(err => {
  console.error('MongoDB Connection Error:', err);
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`ORION Backend Server running on port ${PORT}`);
});
