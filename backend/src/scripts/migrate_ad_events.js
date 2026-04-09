/**
 * migrate_ad_events.js
 * Run once on production to create the ad_events table.
 *
 * Usage:
 *   node backend/src/scripts/migrate_ad_events.js
 */

import pool from '../config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
  const conn = await pool.getConnection();
  try {
    console.log('🔧 Running ad_events migration…');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS ad_events (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        ad_id       INT NOT NULL,
        placement   VARCHAR(50) NOT NULL,
        event_type  ENUM('impression', 'click') NOT NULL,
        ip_address  VARCHAR(45) DEFAULT NULL,
        user_agent  TEXT DEFAULT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ad_id (ad_id),
        INDEX idx_placement (placement),
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ ad_events table created (or already exists).');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    conn.release();
    process.exit(0);
  }
};

migrate();
