/**
 * Environment Variable Validation
 * Validates all required environment variables are set on server start.
 * Fails fast in production if critical secrets are missing.
 */
import dotenv from 'dotenv';
import logger from './logger.js';

dotenv.config();

const REQUIRED_VARS = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

// Production must have URLs for CORS/SEO; reCAPTCHA can be added later (contact form).
const PRODUCTION_REQUIRED = ['SITE_URL', 'FRONTEND_URL'];

const RECOMMENDED_VARS = [
  'DB_PASSWORD',
  'RECAPTCHA_SECRET',
  'RECAPTCHA_SITE_KEY',
];

export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  // Check production-only variables
  if (process.env.NODE_ENV === 'production') {
    for (const key of PRODUCTION_REQUIRED) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    // Ensure JWT_SECRET is not the default dev key
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('dev_secret')) {
      missing.push('JWT_SECRET (must not be default dev key in production)');
    }
    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.includes('dev_refresh')) {
      missing.push('JWT_REFRESH_SECRET (must not be default dev key in production)');
    }
  }

  // Check recommended variables (warn only)
  for (const key of RECOMMENDED_VARS) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    logger.warn(`⚠️  Missing recommended env vars: ${warnings.join(', ')}`);
  }

  // Fail on missing required vars
  if (missing.length > 0) {
    const msg = `❌ Missing required environment variables: ${missing.join(', ')}`;
    logger.error(msg);
    if (process.env.NODE_ENV === 'production') {
      console.error(msg);
      process.exit(1);
    } else {
      console.warn(msg);
    }
  }

  logger.info('✅ Environment validation passed');
};
