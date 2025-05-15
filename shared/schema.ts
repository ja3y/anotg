import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Report categories enum
export const ReportCategory = {
  SCAM: "scam",
  PHISHING: "phishing",
  ILLEGAL: "illegal",
  SUSPICIOUS: "suspicious",
  SPAM: "spam",
  OTHER: "other"
} as const;

export type ReportCategory = typeof ReportCategory[keyof typeof ReportCategory];

// Wallet entity
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  firstSeen: timestamp("first_seen").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  reportCount: integer("report_count").notNull().default(0),
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  reportCount: true,
});

// Wallet reputation
export const walletReputations = pgTable("wallet_reputations", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletReputationSchema = createInsertSchema(walletReputations).omit({
  id: true,
  createdAt: true,
});

// Wallet flags
export const walletFlags = pgTable("wallet_flags", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletFlagSchema = createInsertSchema(walletFlags).omit({
  id: true,
  createdAt: true,
});

// Wallet reports
export const walletReports = pgTable("wallet_reports", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWalletReportSchema = createInsertSchema(walletReports).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.enum([ReportCategory.SCAM, ReportCategory.PHISHING, ReportCategory.ILLEGAL, ReportCategory.SUSPICIOUS, ReportCategory.SPAM, ReportCategory.OTHER])
});

// Bitcoin transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  fromWalletId: integer("from_wallet_id").references(() => wallets.id),
  toWalletId: integer("to_wallet_id").references(() => wallets.id),
  amount: doublePrecision("amount").notNull(),
  fee: doublePrecision("fee").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  confirmed: boolean("confirmed").notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
});

// User entity
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

// Types
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertWalletReputation = z.infer<typeof insertWalletReputationSchema>;
export type WalletReputation = typeof walletReputations.$inferSelect;

export type InsertWalletFlag = z.infer<typeof insertWalletFlagSchema>;
export type WalletFlag = typeof walletFlags.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWalletReport = z.infer<typeof insertWalletReportSchema>;
export type WalletReport = typeof walletReports.$inferSelect;
