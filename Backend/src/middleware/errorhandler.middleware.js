export const errorHandler = (err, req, res, _next) => {
    // Log the full error (useful in development)
    console.error(err);

    const status = err.status || 500;

    res.status(status).json({
        success: false,
        message: err.message || 'Server Error',
        // Hide stack trace in production
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};
