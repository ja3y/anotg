import 'dotenv/config';
import { db } from './db';

async function testConnection() {
  try {
    // Test the connection by querying all tables
    console.log('Testing database connection...');
    
    const users = await db.query.users.findMany();
    console.log('\nUsers:', users);
    
    const wallets = await db.query.wallets.findMany();
    console.log('\nWallets:', wallets);
    
    const transactions = await db.query.transactions.findMany();
    console.log('\nTransactions:', transactions);
    
    console.log('\nDatabase connection successful! All tables are accessible.');
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    process.exit();
  }
}

testConnection(); 