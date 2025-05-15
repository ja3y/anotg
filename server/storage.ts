import {
  User, InsertUser,
  Wallet, InsertWallet,
  WalletReputation, InsertWalletReputation,
  WalletFlag, InsertWalletFlag,
  Transaction, InsertTransaction,
  WalletReport, InsertWalletReport,
  ReportCategory,
  users, wallets, walletReputations, walletFlags, transactions, walletReports
} from "@shared/schema";
import { db } from "./db";
import { eq, avg, count, and, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet methods
  getWallet(address: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  
  // Reputation methods
  getWalletReputation(address: string): Promise<{ score: number; reviews: number }>;
  rateWallet(address: string, userId: number, rating: number, comment?: string): Promise<void>;
  
  // Flag methods
  getWalletFlags(address: string): Promise<{ type: string; title: string; description: string }[]>;
  flagWallet(address: string, userId: number, reason: string): Promise<void>;
  isWalletFlagged(address: string): Promise<boolean>;
  
  // Transaction methods
  storeTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Report methods
  reportWallet(address: string, userId: number, category: ReportCategory, reason: string): Promise<void>;
  getWalletReports(address: string): Promise<{ 
    count: number; 
    reports: { 
      category: ReportCategory;
      reason: string; 
      createdAt: Date;
    }[];
    categoryCounts: Record<ReportCategory, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser })
      .returning();
    return user;
  }
  
  // Wallet methods
  async getWallet(address: string): Promise<Wallet | undefined> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.address, address));
    return wallet;
  }
  
  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const now = new Date();
    const [wallet] = await db
      .insert(wallets)
      .values({
        address: insertWallet.address,
        firstSeen: insertWallet.firstSeen || now,
        lastUpdated: insertWallet.lastUpdated || now
      })
      .returning();
    return wallet;
  }
  
  // Reputation methods
  async getWalletReputation(address: string): Promise<{ score: number; reviews: number }> {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return { score: 0, reviews: 0 };
    }
    
    const [result] = await db
      .select({
        avgRating: avg(walletReputations.rating),
        reviewCount: count()
      })
      .from(walletReputations)
      .where(eq(walletReputations.walletId, wallet.id));
      
    return {
      score: result?.avgRating ? Number(result.avgRating) : 0,
      reviews: result?.reviewCount || 0
    };
  }
  
  async rateWallet(address: string, userId: number, rating: number, comment?: string): Promise<void> {
    // Get or create wallet
    let wallet = await this.getWallet(address);
    if (!wallet) {
      const now = new Date();
      wallet = await this.createWallet({ 
        address,
        firstSeen: now,
        lastUpdated: now
      });
    }
    
    // Check if user already rated this wallet
    const [existingRating] = await db
      .select()
      .from(walletReputations)
      .where(
        and(
          eq(walletReputations.walletId, wallet.id),
          eq(walletReputations.userId, userId)
        )
      );
    
    if (existingRating) {
      // Update existing rating
      await db
        .update(walletReputations)
        .set({
          rating,
          comment: comment || null
        })
        .where(eq(walletReputations.id, existingRating.id));
    } else {
      // Insert new rating
      await db
        .insert(walletReputations)
        .values({
          walletId: wallet.id,
          userId,
          rating,
          comment: comment || null
        });
    }
  }
  
  // Flag methods
  async getWalletFlags(address: string): Promise<{ type: string; title: string; description: string }[]> {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return [];
    }
    
    const flags = await db
      .select()
      .from(walletFlags)
      .where(eq(walletFlags.walletId, wallet.id));
    
    // Map reasons to descriptive objects for UI display
    return flags.map(flag => {
      switch (flag.reason) {
        case "scam":
          return { 
            type: "warning", 
            title: "Potential Scam", 
            description: "This wallet has been flagged for potential scam activity." 
          };
        case "illegal":
          return { 
            type: "warning", 
            title: "Potentially Illegal Activity", 
            description: "This wallet has been flagged for potentially illegal activity." 
          };
        case "phishing":
          return { 
            type: "warning", 
            title: "Phishing or Hacking", 
            description: "This wallet has been linked to phishing or hacking attempts." 
          };
        case "suspicious":
          return { 
            type: "warning", 
            title: "Suspicious Pattern", 
            description: "This wallet exhibits unusual transaction patterns." 
          };
        default:
          return { 
            type: "warning", 
            title: "Flagged", 
            description: `This wallet has been flagged: ${flag.reason}` 
          };
      }
    });
  }
  
  async flagWallet(address: string, userId: number, reason: string): Promise<void> {
    // Get or create wallet
    let wallet = await this.getWallet(address);
    if (!wallet) {
      const now = new Date();
      wallet = await this.createWallet({ 
        address,
        firstSeen: now,
        lastUpdated: now
      });
    }
    
    // Check if user already flagged this wallet for this reason
    const [existingFlag] = await db
      .select()
      .from(walletFlags)
      .where(
        and(
          eq(walletFlags.walletId, wallet.id),
          eq(walletFlags.userId, userId),
          eq(walletFlags.reason, reason)
        )
      );
    
    if (!existingFlag) {
      // Insert new flag
      await db
        .insert(walletFlags)
        .values({
          walletId: wallet.id,
          userId,
          reason
        });
    }
  }
  
  async isWalletFlagged(address: string): Promise<boolean> {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return false;
    }
    
    const [result] = await db
      .select({ count: count() })
      .from(walletFlags)
      .where(eq(walletFlags.walletId, wallet.id));
      
    return result?.count > 0;
  }
  
  // Transaction methods
  async storeTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
      
    return transaction;
  }

  // Report methods
  async reportWallet(address: string, userId: number, category: ReportCategory, reason: string): Promise<void> {
    // Get or create wallet
    let wallet = await this.getWallet(address);
    if (!wallet) {
      const now = new Date();
      wallet = await this.createWallet({ 
        address,
        firstSeen: now,
        lastUpdated: now
      });
    }
    
    // Insert new report
    await db
      .insert(walletReports)
      .values({
        walletId: wallet.id,
        userId,
        category,
        reason
      });
    
    // Increment report count
    await db
      .update(wallets)
      .set({
        reportCount: sql`${wallets.reportCount} + 1`
      })
      .where(eq(wallets.id, wallet.id));
  }
  
  async getWalletReports(address: string): Promise<{ 
    count: number; 
    reports: { 
      category: ReportCategory;
      reason: string; 
      createdAt: Date;
    }[];
    categoryCounts: Record<ReportCategory, number>;
  }> {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return { 
        count: 0, 
        reports: [],
        categoryCounts: Object.values(ReportCategory).reduce((acc, category) => {
          acc[category] = 0;
          return acc;
        }, {} as Record<ReportCategory, number>)
      };
    }
    
    const reports = await db
      .select({
        category: walletReports.category,
        reason: walletReports.reason,
        createdAt: walletReports.createdAt
      })
      .from(walletReports)
      .where(eq(walletReports.walletId, wallet.id))
      .orderBy(walletReports.createdAt);
    
    // Calculate category counts
    const categoryCounts = reports.reduce((acc, report) => {
      const category = report.category as ReportCategory;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<ReportCategory, number>);
    
    // Ensure all categories are present in the counts
    Object.values(ReportCategory).forEach(category => {
      if (!(category in categoryCounts)) {
        categoryCounts[category] = 0;
      }
    });
    
    return {
      count: wallet.reportCount,
      reports: reports.map(report => ({
        ...report,
        category: report.category as ReportCategory
      })),
      categoryCounts
    };
  }
}

export const storage = new DatabaseStorage();
