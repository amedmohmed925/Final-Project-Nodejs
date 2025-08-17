// config/queue.js
// Bull-based queue with graceful fallback when REDIS_URL is missing.
const Bull = require('bull');

function createQueue(name) {
  const url = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
  if (!url) return null;
  return new Bull(name, url, { defaultJobOptions: { removeOnComplete: true, removeOnFail: 50 } });
}

module.exports = { createQueue };
