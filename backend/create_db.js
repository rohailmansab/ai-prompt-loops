import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'ai_prompt_hub'}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log('Database created or already exists.');
    await connection.end();
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
}

createDb();
