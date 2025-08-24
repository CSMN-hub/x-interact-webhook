// index.js
// Install once: npm i express cors
const express = require('express');
const cors = require('cors');

const app = express();

// Enable CORS before any routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors()); // Handle preflight

app.use(express.json());

// Health check route
app.get('/health', (_, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Your other routes go here (optional)
// app.post('/fetch-tweets', (req, res) => { /* ... */ });
// app.post('/post-reply', (req, res) => { /* ... */ });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
