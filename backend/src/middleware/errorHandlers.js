/**
 * Error handling middleware for SIH25027 API
 * Prototype developed by Team Hackon
 */

const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.path} is not a valid API endpoint`,
    team: 'Prototype developed by Team Hackon'
  });
};

const errorHandler = (error, req, res, next) => {
  logger.error('API Error:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: error.name || 'Internal Server Error',
    message: error.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = { errorHandler, notFoundHandler };