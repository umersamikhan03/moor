const redis = require('redis');

let client = null;
let isRedisEnabled = false;

// Check if Redis is enabled
if (process.env.REDIS_ENABLED === 'true') {
  try {
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: parseInt(process.env.REDIS_PORT) || 6379
      },
      password: process.env.REDIS_PASSWORD || undefined
    });

    client.on('error', (err) => {
      console.error('Redis error:', err);
      isRedisEnabled = false;
    });

    client.connect()
      .then(() => {
        console.log('✅ Connected to Redis');
        isRedisEnabled = true;
      })
      .catch(err => {
        console.warn('⚠️  Redis connection failed, continuing without cache:', err.message);
        isRedisEnabled = false;
        client = null;
      });
  } catch (error) {
    console.warn('⚠️  Redis initialization failed, continuing without cache:', error.message);
    client = null;
    isRedisEnabled = false;
  }
} else {
  console.log('ℹ️  Redis caching is disabled');
}

module.exports = {
  client,
  isEnabled: () => isRedisEnabled && client !== null
};
