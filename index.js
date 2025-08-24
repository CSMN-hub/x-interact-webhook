index.js

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

// Example: your other routes go below
// app.post('/fetch-tweets', (req, res) => { /* ... */ });
// app.post('/post-reply', (req, res) => { /* ... */ });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
package.json

{
  "name": "x-interact-webhook",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2"
  }
}
 - In a terminal: cd into that folder, run:
   - npm install
   - node index.js
   - Open http://localhost:3001/health — you should see JSON.
 - Deploy to a host (e.g., Railway):
   - Put these two files in a new GitHub repo.
   - On Railway → New Project → Deploy from GitHub → select your repo.
   - Start command uses “start” from package.json automatically (node index.js).
   - After deploy, copy the public URL.
