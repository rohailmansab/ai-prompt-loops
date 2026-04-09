import logger from '../config/logger.js';

/**
 * Suspicious Activity Detector
 * Logs and optionally blocks requests with attack patterns
 */

const SUSPICIOUS_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,           // SQL injection
  /<script[^>]*>.*<\/script>/gi,               // XSS script tags
  /javascript\s*:/gi,                          // JavaScript protocol
  /on\w+\s*=/gi,                               // Event handlers
  /union\s+(all\s+)?select/gi,                 // SQL UNION attack
  /exec(\s|\+)+(s|x)p\w+/gi,                  // SQL Server exec
  /\.\.\//g,                                    // Path traversal
  /etc\/passwd/gi,                             // Unix file access
  /cmd\.exe/gi,                                // Windows command
];

const MAX_BODY_DEPTH = 5;
const MAX_STRING_LENGTH = 10000;

/**
 * Deep-check all string values in request body/query/params for suspect patterns
 */
const containsSuspiciousContent = (obj, depth = 0) => {
  if (depth > MAX_BODY_DEPTH) return false;
  if (typeof obj === 'string') {
    if (obj.length > MAX_STRING_LENGTH) return 'oversized_payload';
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(obj)) {
        pattern.lastIndex = 0; // reset regex state
        return pattern.source;
      }
    }
    return false;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = containsSuspiciousContent(item, depth + 1);
      if (result) return result;
    }
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      // Also check keys for injection
      const result = containsSuspiciousContent(obj[key], depth + 1);
      if (result) return result;
    }
  }
  return false;
};

export const suspiciousActivityDetector = (req, res, next) => {
  const sources = [
    { name: 'body', data: req.body },
    { name: 'query', data: req.query },
    { name: 'params', data: req.params },
  ];

  for (const source of sources) {
    if (!source.data) continue;
    const match = containsSuspiciousContent(source.data);
    if (match) {
      logger.warn(`🚨 Suspicious activity detected`, {
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        source: source.name,
        pattern: typeof match === 'string' ? match : 'unknown',
        userAgent: req.headers['user-agent'],
      });

      // In production, block the request; in dev, just log
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ error: 'Malformed request detected.' });
      }
    }
  }

  next();
};

/**
 * Request Size Guard
 * Prevents abuse via oversized payloads beyond what Express body-parser catches
 */
export const requestSizeGuard = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  if (contentLength > MAX_SIZE) {
    logger.warn(`Oversized request blocked: ${contentLength} bytes`, { ip: req.ip, path: req.originalUrl });
    return res.status(413).json({ error: 'Request entity too large' });
  }

  next();
};
