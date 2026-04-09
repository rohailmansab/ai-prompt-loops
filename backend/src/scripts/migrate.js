/**
 * Database Migration: Add security columns to users table
 * - failed_login_attempts: Track brute-force attempts
 * - locked_until: Account lockout timestamp
 * - refresh_token_hash: For refresh token revocation
 * - token_version: For invalidating all sessions
 * - last_login: Track last login time
 */
import pool from '../config/database.js';

const migrations = [
  {
    name: 'add_failed_login_attempts',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0`,
  },
  {
    name: 'add_locked_until',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP NULL DEFAULT NULL`,
  },
  {
    name: 'add_refresh_token_hash',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255) DEFAULT NULL`,
  },
  {
    name: 'add_token_version',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0`,
  },
  {
    name: 'add_last_login',
    sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL DEFAULT NULL`,
  },
];

const runMigrations = async () => {
  const connection = await pool.getConnection();
  try {
    for (const migration of migrations) {
      try {
        await connection.query(migration.sql);
        console.log(`✅ Migration "${migration.name}" applied`);
      } catch (err) {
        // If column already exists, skip gracefully
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`⏭️  Migration "${migration.name}" skipped (already applied)`);
        } else {
          console.error(`❌ Migration "${migration.name}" failed:`, err.message);
        }
      }
    }
    console.log('✅ All security migrations complete');
  } finally {
    connection.release();
  }
};

// Run directly if executed as a script
runMigrations()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

export default runMigrations;
