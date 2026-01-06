const redisConfig = require('../config/redisClient');

const cacheMiddleware = (req, res, next) => {
    // If Redis is not enabled or available, skip caching
    if (!redisConfig.isEnabled()) {
        return next();
    }

    const key = req.originalUrl;
    const redisClient = redisConfig.client;

    redisClient.get(key)
        .then(data => {
            if (data !== null) {
                res.setHeader('Content-Type', 'application/json');
                res.status(200).send(data);
            } else {
                const originalSend = res.send;
                res.send = (body) => {
                    // Only cache if Redis is still available
                    if (redisConfig.isEnabled()) {
                        redisClient.setEx(key, 3600, body) // Cache for 1 hour
                            .catch(err => console.warn('Redis cache write failed:', err.message));
                    }
                    originalSend.call(res, body);
                };
                next();
            }
        })
        .catch(err => {
            console.warn('Redis cache read failed, proceeding without cache:', err.message);
            next();
        });
};

module.exports = cacheMiddleware;
