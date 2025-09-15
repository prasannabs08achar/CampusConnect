import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    // Time window in milliseconds (default 1 minute)
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000,
    // Max number of requests per window per IP
    max: Number(process.env.RATE_LIMIT_MAX) || 120,
    message: 'Too many requests, slow down',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false,  // Disable the old `X-RateLimit-*` headers
});
