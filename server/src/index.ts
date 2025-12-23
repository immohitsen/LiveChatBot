import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';

// Environment variables load karo
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Frontend ko access dene ke liye
app.use(express.json()); // JSON data padhne ke liye

// Routes
app.use('/api/chat', chatRoutes);

// Health Check Route (Browser me check karne ke liye)
app.get('/', (req, res) => {
  res.send('Spur Chat API is running 🚀');
});

// Server Start
app.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
});