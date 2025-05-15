import 'dotenv/config';
import { db } from './db';
import { insertUserSchema, insertWalletSchema, insertTransactionSchema } from '@shared/schema';
import { hash } from 'bcrypt';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create a test user
    const hashedPassword = await hash('test123', 10);
    const [user] = await db.insert(users).values({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
    }).returning();
    console.log('Created test user:', user);

    // Create some test wallets
    const [wallet1] = await db.insert(wallets).values({
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Example Bitcoin address
      firstSeen: new Date(),
      lastUpdated: new Date(),
    }).returning();
    console.log('Created test wallet 1:', wallet1);

    const [wallet2] = await db.insert(wallets).values({
      address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', // Example Bitcoin address
      firstSeen: new Date(),
      lastUpdated: new Date(),
    }).returning();
    console.log('Created test wallet 2:', wallet2);

    // Create some test transactions
    const [transaction] = await db.insert(transactions).values({
      hash: '0x123abc...', // Example transaction hash
      fromWalletId: wallet1.id,
      toWalletId: wallet2.id,
      amount: 0.5,
      fee: 0.0001,
      timestamp: new Date(),
      confirmed: true,
    }).returning();
    console.log('Created test transaction:', transaction);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

seed(); 