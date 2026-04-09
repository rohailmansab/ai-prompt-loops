import logger from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`HTTP ${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack, ip: req.ip });

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry. This record already exists.',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      error: 'Referenced record not found.',
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: err.message,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};
