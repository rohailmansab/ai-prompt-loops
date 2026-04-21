/**
 * Environment Variable Validation
 * Railway/paas: missing vars log hoti hain; crash sirf STRICT_ENV=true par (optional hard fail).
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

const PRODUCTION_REQUIRED = ['SITE_URL', 'FRONTEND_URL'];

const RECOMMENDED_VARS = [
  'DB_PASSWORD',
  'RECAPTCHA_SECRET',
  'RECAPTCHA_SITE_KEY',
];

export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SITE_URL?.trim() && process.env.FRONTEND_URL?.trim()) {
      process.env.SITE_URL = process.env.FRONTEND_URL.trim();
    }
    if (!process.env.FRONTEND_URL?.trim() && process.env.SITE_URL?.trim()) {
      process.env.FRONTEND_URL = process.env.SITE_URL.trim();
    }
  }

  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) missing.push(key);
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of PRODUCTION_REQUIRED) {
      if (!process.env[key]?.trim()) missing.push(key);
    }
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET?.includes('dev_secret')) {
    warnings.push('JWT_SECRET contains "dev_secret" — use a fresh secret in production');
  }
  if (process.env.NODE_ENV === 'production' && process.env.JWT_REFRESH_SECRET?.includes('dev_refresh')) {
    warnings.push('JWT_REFRESH_SECRET contains "dev_refresh" — use a fresh secret in production');
  }

  for (const key of RECOMMENDED_VARS) {
    if (!process.env[key]) warnings.push(key);
  }

  if (warnings.length > 0) {
    logger.warn(`⚠️  Env warnings: ${warnings.join(', ')}`);
  }

  if (missing.length > 0) {
    const msg = `❌ Missing environment variables: ${missing.join(', ')}`;
    logger.error(msg);
    console.error('\n========== ENV CHECK FAILED ==========');
    console.error(msg);
    console.error('Go to Railway → Service → Variables and add these.\n');

    const strictFail = process.env.STRICT_ENV === 'true';
    if (strictFail && process.env.NODE_ENV === 'production') {
      console.error('STRICT_ENV=true → exiting.');
      process.exit(1);
    }

    console.error(
      '⚠️  Starting anyway so logs stay visible. Fix variables for DB/auth.\n' +
        '(Set STRICT_ENV=true only when you want the process to exit on missing vars.)\n'
    );
    console.error('========================================\n');
    return;
  }

  logger.info('✅ Environment validation passed');
};
