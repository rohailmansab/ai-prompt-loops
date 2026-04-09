/**
 * Migration: Add ads table
 *
 * Run manually in production:
 *   node backend/src/scripts/migrate_ads.js
 */
import pool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        placement ENUM(
          'prompt_top',
          'prompt_bottom',
          'sidebar',
          'blog_top',
          'blog_middle',
          'blog_bottom',
          'list_inline'
        ) NOT NULL,
        ad_code LONGTEXT NOT NULL,
        status BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_placement (placement),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ ads table created (or already existed)');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    conn.release();
    process.exit(0);
  }
};

run();
