import 'dotenv/config';
import { pool } from './db';

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('Current database time:', result.rows[0].now);
    
    client.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    process.exit();
  }
}

testConnection(); 