// config/redisClient.js
const redis = require('redis');

let client = null;
const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';

async function getRedisClient() {
  if (!url) return null;
  if (client) return client;
  client = redis.createClient({ url });
  client.on('error', (err) => console.error('Redis error:', err.message));
  await client.connect();
  return client;
}

module.exports = { getRedisClient };
