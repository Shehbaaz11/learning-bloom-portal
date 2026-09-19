const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./config/db');
const admissionRoutes = require('./routes/admission');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admission', admissionRoutes);

app.get('/', (req, res) => {
  res.json({ message: '✅ Learning High School Backend Running!' });
});

app.get("/health", (req, res) => {
  res.json({
    message: "Backend Preview Updated",
    status: "ok"
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await connectDB();
});