// index.js
// Dependencies: npm i express cors twitter-api-v2
const express = require('express');
const cors = require('cors');
const { TwitterApi } = require('twitter-api-v2');

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());

// Health check (does not require Twitter tokens)
app.get('/health', (_, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// Helper: create Twitter client only when needed
function getTwitterClient() {
  const {
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
  } = process.env;

  const missing = [];
  if (!TWITTER_API_KEY) missing.push('TWITTER_API_KEY');
  if (!TWITTER_API_SECRET) missing.push('TWITTER_API_SECRET');
  if (!TWITTER_ACCESS_TOKEN) missing.push('TWITTER_ACCESS_TOKEN');
  if (!TWITTER_ACCESS_SECRET) missing.push('TWITTER_ACCESS_SECRET');

  if (missing.length) {
    throw new Error(`Missing Twitter env vars: ${missing.join(', ')}`);
  }

  return new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  });
}

// POST /fetch-tweets  { "username": "jack" }
app.post('/fetch-tweets', async (req, res) => {
  try {
    const { username } = req.body || {};
    if (!username) return res.status(400).json({ error: 'username is required' });

    const clean = String(username).replace('@', '').trim();
    const client = getTwitterClient();

    const userResp = await client.v2.userByUsername(clean, {
      'user.fields': ['name', 'username', 'id'],
    });
    if (!userResp?.data) return res.status(404).json({ error: 'User not found' });

    const userId = userResp.data.id;

    // Get recent tweets (exclude RTs/replies)
    const timeline = await client.v2.userTimeline(userId, {
      max_results: 5,
      exclude: ['replies', 'retweets'],
      'tweet.fields': ['created_at', 'id', 'text'],
    });

    const tweets = timeline.tweets || timeline._realData?.data || [];
    const latest = tweets[0];
    if (!latest) return res.status(404).json({ error: 'No public tweets found' });

    return res.json({
      username: userResp.data.username,
      display_name: userResp.data.name,
      user_id: userId,
      latest_tweet: {
        id: latest.id,
        text: latest.text,
        created_at: latest.created_at,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /post-reply  { "text": "reply...", "reply_to": "tweet_id" }
app.post('/post-reply', async (req, res) => {
  try {
    const { text, reply_to } = req.body || {};
    if (!text || !reply_to) {
      return res.status(400).json({ error: 'text and reply_to are required' });
    }

    const client = getTwitterClient();
    const result = await client.v2.tweet({
      text: String(text).slice(0, 280),
      reply: { in_reply_to_tweet_id: String(reply_to) },
    });

    return res.json({ success: true, tweet: result?.data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Webhook server listening on ${PORT}`));
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
    "express": "^4.19.2",
    "twitter-api-v2": "^1.16.2"
  }
}
