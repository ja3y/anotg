var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  ReportCategory: () => ReportCategory,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWalletFlagSchema: () => insertWalletFlagSchema,
  insertWalletReportSchema: () => insertWalletReportSchema,
  insertWalletReputationSchema: () => insertWalletReputationSchema,
  insertWalletSchema: () => insertWalletSchema,
  transactions: () => transactions,
  users: () => users,
  walletFlags: () => walletFlags,
  walletReports: () => walletReports,
  walletReputations: () => walletReputations,
  wallets: () => wallets
});
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var ReportCategory = {
  SCAM: "scam",
  PHISHING: "phishing",
  ILLEGAL: "illegal",
  SUSPICIOUS: "suspicious",
  SPAM: "spam",
  OTHER: "other"
};
var wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  firstSeen: timestamp("first_seen").notNull(),
  lastUpdated: timestamp("last_updated").notNull(),
  reportCount: integer("report_count").notNull().default(0)
});
var insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  reportCount: true
});
var walletReputations = pgTable("wallet_reputations", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertWalletReputationSchema = createInsertSchema(walletReputations).omit({
  id: true,
  createdAt: true
});
var walletFlags = pgTable("wallet_flags", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertWalletFlagSchema = createInsertSchema(walletFlags).omit({
  id: true,
  createdAt: true
});
var walletReports = pgTable("wallet_reports", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  userId: integer("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertWalletReportSchema = createInsertSchema(walletReports).omit({
  id: true,
  createdAt: true
}).extend({
  category: z.enum([ReportCategory.SCAM, ReportCategory.PHISHING, ReportCategory.ILLEGAL, ReportCategory.SUSPICIOUS, ReportCategory.SPAM, ReportCategory.OTHER])
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  hash: text("hash").notNull().unique(),
  fromWalletId: integer("from_wallet_id").references(() => wallets.id),
  toWalletId: integer("to_wallet_id").references(() => wallets.id),
  amount: doublePrecision("amount").notNull(),
  fee: doublePrecision("fee").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  confirmed: boolean("confirmed").notNull()
});
var insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true
});
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true
});

// server/db.ts
import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, avg, count, and, sql } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({ ...insertUser }).returning();
    return user;
  }
  // Wallet methods
  async getWallet(address) {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.address, address));
    return wallet;
  }
  async createWallet(insertWallet) {
    const now = /* @__PURE__ */ new Date();
    const [wallet] = await db.insert(wallets).values({
      address: insertWallet.address,
      firstSeen: insertWallet.firstSeen || now,
      lastUpdated: insertWallet.lastUpdated || now
    }).returning();
    return wallet;
  }
  // Reputation methods
  async getWalletReputation(address) {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return { score: 0, reviews: 0 };
    }
    const [result] = await db.select({
      avgRating: avg(walletReputations.rating),
      reviewCount: count()
    }).from(walletReputations).where(eq(walletReputations.walletId, wallet.id));
    return {
      score: result?.avgRating ? Number(result.avgRating) : 0,
      reviews: result?.reviewCount || 0
    };
  }
  async rateWallet(address, userId, rating, comment) {
    let wallet = await this.getWallet(address);
    if (!wallet) {
      const now = /* @__PURE__ */ new Date();
      wallet = await this.createWallet({
        address,
        firstSeen: now,
        lastUpdated: now
      });
    }
    const [existingRating] = await db.select().from(walletReputations).where(
      and(
        eq(walletReputations.walletId, wallet.id),
        eq(walletReputations.userId, userId)
      )
    );
    if (existingRating) {
      await db.update(walletReputations).set({
        rating,
        comment: comment || null
      }).where(eq(walletReputations.id, existingRating.id));
    } else {
      await db.insert(walletReputations).values({
        walletId: wallet.id,
        userId,
        rating,
        comment: comment || null
      });
    }
  }
  // Flag methods
  async getWalletFlags(address) {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return [];
    }
    const flags = await db.select().from(walletFlags).where(eq(walletFlags.walletId, wallet.id));
    return flags.map((flag) => {
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
  async flagWallet(address, userId, reason) {
    let wallet = await this.getWallet(address);
    if (!wallet) {
      const now = /* @__PURE__ */ new Date();
      wallet = await this.createWallet({
        address,
        firstSeen: now,
        lastUpdated: now
      });
    }
    const [existingFlag] = await db.select().from(walletFlags).where(
      and(
        eq(walletFlags.walletId, wallet.id),
        eq(walletFlags.userId, userId),
        eq(walletFlags.reason, reason)
      )
    );
    if (!existingFlag) {
      await db.insert(walletFlags).values({
        walletId: wallet.id,
        userId,
        reason
      });
    }
  }
  async isWalletFlagged(address) {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return false;
    }
    const [result] = await db.select({ count: count() }).from(walletFlags).where(eq(walletFlags.walletId, wallet.id));
    return result?.count > 0;
  }
  // Transaction methods
  async storeTransaction(insertTransaction) {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }
  // Report methods
  async reportWallet(address, userId, category, reason) {
    let wallet = await this.getWallet(address);
    if (!wallet) {
      const now = /* @__PURE__ */ new Date();
      wallet = await this.createWallet({
        address,
        firstSeen: now,
        lastUpdated: now
      });
    }
    await db.insert(walletReports).values({
      walletId: wallet.id,
      userId,
      category,
      reason
    });
    await db.update(wallets).set({
      reportCount: sql`${wallets.reportCount} + 1`
    }).where(eq(wallets.id, wallet.id));
  }
  async getWalletReports(address) {
    const wallet = await this.getWallet(address);
    if (!wallet) {
      return {
        count: 0,
        reports: [],
        categoryCounts: Object.values(ReportCategory).reduce((acc, category) => {
          acc[category] = 0;
          return acc;
        }, {})
      };
    }
    const reports = await db.select({
      category: walletReports.category,
      reason: walletReports.reason,
      createdAt: walletReports.createdAt
    }).from(walletReports).where(eq(walletReports.walletId, wallet.id)).orderBy(walletReports.createdAt);
    const categoryCounts = reports.reduce((acc, report) => {
      const category = report.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    Object.values(ReportCategory).forEach((category) => {
      if (!(category in categoryCounts)) {
        categoryCounts[category] = 0;
      }
    });
    return {
      count: wallet.reportCount,
      reports: reports.map((report) => ({
        ...report,
        category: report.category
      })),
      categoryCounts
    };
  }
};
var storage = new DatabaseStorage();

// server/services/bitcoin-api.ts
import axios from "axios";
var BitcoinApi = class {
  apiKey;
  baseUrl;
  TRANSACTIONS_PER_PAGE = 50;
  RATE_LIMIT_DELAY = 1e3;
  // 1 second
  HEADERS = { "Accept": "application/json" };
  constructor() {
    this.apiKey = process.env.BLOCKCHAIN_API_KEY || "";
    this.baseUrl = "https://blockchain.info";
  }
  validateBitcoinAddress(address) {
    const patterns = {
      legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      segwit: /^bc1[ac-hj-np-z02-9]{11,71}$/,
      p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/
    };
    return Object.values(patterns).some((pattern) => pattern.test(address));
  }
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          ...params,
          api_key: this.apiKey
        },
        headers: this.HEADERS,
        timeout: 2e4
        // 20 seconds timeout
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          const retryAfter = parseInt(error.response.headers["retry-after"] || "60");
          console.log(`Rate limited. Waiting ${retryAfter} seconds...`);
          await this.sleep(retryAfter * 1e3);
          return this.makeRequest(endpoint, params);
        }
        if (error.response?.status === 404) {
          throw new Error("Wallet address not found on the blockchain");
        }
        console.error("API Error:", error.response?.data || error.message);
      }
      throw new Error("Failed to fetch data from blockchain API");
    }
  }
  async fetchBTCPrice() {
    try {
      const data = await this.makeRequest("/ticker");
      return data.USD.last;
    } catch (error) {
      console.error("Error fetching BTC price:", error);
      return 0;
    }
  }
  async fetchTransactions(address) {
    const transactions2 = [];
    let offset = 0;
    while (true) {
      try {
        const data = await this.makeRequest(`/rawaddr/${address}`, {
          limit: this.TRANSACTIONS_PER_PAGE,
          offset
        });
        if (!data.txs || data.txs.length === 0) {
          break;
        }
        transactions2.push(...data.txs);
        if (data.txs.length < this.TRANSACTIONS_PER_PAGE) {
          break;
        }
        offset += data.txs.length;
        await this.sleep(this.RATE_LIMIT_DELAY);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        break;
      }
    }
    return transactions2;
  }
  async fetchBalance(address) {
    try {
      const data = await this.makeRequest(`/rawaddr/${address}`);
      return data.final_balance;
    } catch (error) {
      console.error("Error fetching balance:", error);
      return 0;
    }
  }
  async getWalletData(address) {
    try {
      if (!this.validateBitcoinAddress(address)) {
        throw new Error("Invalid Bitcoin address format");
      }
      const [balance, btcPrice] = await Promise.all([
        this.fetchBalance(address),
        this.fetchBTCPrice()
      ]);
      return {
        address,
        balance: {
          btc: balance / 1e8,
          usd: balance / 1e8 * btcPrice
        },
        transactions: {
          count: (await this.fetchTransactions(address)).length,
          firstDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
          // We'll update this with actual first transaction date
        }
      };
    } catch (error) {
      console.error("Error in getWalletData:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch wallet data");
    }
  }
  async getWalletTransactions(address, options = {}) {
    try {
      const { page = 1, limit = 10, filter = "all", sort = "desc" } = options;
      if (!this.validateBitcoinAddress(address)) {
        throw new Error("Invalid Bitcoin address format");
      }
      const transactions2 = await this.fetchTransactions(address);
      let filteredTransactions = transactions2;
      if (filter !== "all") {
        filteredTransactions = transactions2.filter(
          (tx) => tx.inputs.some((input) => input.prev_out.addr === address) === (filter === "sent")
        );
      }
      if (sort === "asc") {
        filteredTransactions.reverse();
      }
      const start = (page - 1) * limit;
      const paginatedTransactions = filteredTransactions.slice(start, start + limit);
      return {
        transactions: paginatedTransactions.map((tx) => ({
          hash: tx.hash,
          date: new Date(tx.time * 1e3).toISOString().split("T")[0],
          time: new Date(tx.time * 1e3).toTimeString().split(" ")[0],
          type: tx.inputs.some((input) => input.prev_out.addr === address) ? "sent" : "received",
          otherAddress: tx.inputs.some((input) => input.prev_out.addr === address) ? tx.out[0].addr : tx.inputs[0].prev_out.addr,
          amount: Math.abs(tx.result) / 1e8,
          fee: tx.fee / 1e8
        })),
        page,
        limit,
        total: filteredTransactions.length
      };
    } catch (error) {
      console.error("Error in getWalletTransactions:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch transactions");
    }
  }
  async getRelatedWallets(address) {
    try {
      if (!this.validateBitcoinAddress(address)) {
        throw new Error("Invalid Bitcoin address format");
      }
      const transactions2 = await this.fetchTransactions(address);
      const relatedAddresses = /* @__PURE__ */ new Set();
      transactions2.forEach((tx) => {
        tx.inputs.forEach((input) => {
          if (input.prev_out.addr && input.prev_out.addr !== address) {
            relatedAddresses.add(input.prev_out.addr);
          }
        });
        tx.out.forEach((output) => {
          if (output.addr && output.addr !== address) {
            relatedAddresses.add(output.addr);
          }
        });
      });
      const relatedWallets = [];
      for (const addr of Array.from(relatedAddresses).slice(0, 5)) {
        try {
          const balance = await this.fetchBalance(addr);
          const transactions3 = await this.fetchTransactions(addr);
          relatedWallets.push({
            address: addr,
            balance: (balance / 1e8).toFixed(4),
            transactionCount: transactions3.length
          });
          await this.sleep(this.RATE_LIMIT_DELAY);
        } catch (error) {
          console.error(`Error fetching data for related wallet ${addr}:`, error);
        }
      }
      return relatedWallets;
    } catch (error) {
      console.error("Error in getRelatedWallets:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch related wallets");
    }
  }
};
var bitcoinApi = new BitcoinApi();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/wallet/:address", async (req, res) => {
    try {
      const { address } = req.params;
      const walletData = await bitcoinApi.getWalletData(address);
      const reputation = await storage.getWalletReputation(address);
      const flags = await storage.getWalletFlags(address);
      res.json({
        address,
        balance: walletData.balance,
        transactions: walletData.transactions,
        reputation,
        flags
      });
    } catch (error) {
      console.error("Error getting wallet data:", error);
      if (error instanceof Error && error.message === "Invalid Bitcoin address format") {
        res.status(400).json({ message: "Invalid Bitcoin address format" });
      } else if (error instanceof Error && error.message === "Wallet address not found on the blockchain") {
        res.status(404).json({ message: "Wallet address not found on the blockchain" });
      } else {
        res.status(500).json({ message: "Failed to fetch wallet data" });
      }
    }
  });
  app2.get("/api/wallet/:address/transactions", async (req, res) => {
    try {
      const { address } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filter = req.query.filter || "all";
      const sort = req.query.sort || "desc";
      const transactions2 = await bitcoinApi.getWalletTransactions(address, {
        page,
        limit,
        filter,
        sort
      });
      res.json(transactions2);
    } catch (error) {
      console.error("Error getting transactions:", error);
      if (error instanceof Error && error.message === "Invalid Bitcoin address format") {
        res.status(400).json({ message: "Invalid Bitcoin address format" });
      } else if (error instanceof Error && error.message === "Wallet address not found on the blockchain") {
        res.status(404).json({ message: "Wallet address not found on the blockchain" });
      } else {
        res.status(500).json({ message: "Failed to fetch transactions" });
      }
    }
  });
  app2.get("/api/wallet/:address/related", async (req, res) => {
    try {
      const { address } = req.params;
      const relatedWallets = await bitcoinApi.getRelatedWallets(address);
      const enhancedWallets = await Promise.all(
        relatedWallets.map(async (wallet) => {
          const reputation = await storage.getWalletReputation(wallet.address);
          const isFlagged = await storage.isWalletFlagged(wallet.address);
          return {
            ...wallet,
            rating: reputation.score,
            flagged: isFlagged
          };
        })
      );
      res.json({ wallets: enhancedWallets });
    } catch (error) {
      console.error("Error getting related wallets:", error);
      if (error instanceof Error && error.message === "Invalid Bitcoin address format") {
        res.status(400).json({ message: "Invalid Bitcoin address format" });
      } else if (error instanceof Error && error.message === "Wallet address not found on the blockchain") {
        res.status(404).json({ message: "Wallet address not found on the blockchain" });
      } else {
        res.status(500).json({ message: "Failed to fetch related wallets" });
      }
    }
  });
  app2.post("/api/wallet/:address/rate", async (req, res) => {
    try {
      const { address } = req.params;
      const ratingSchema = z2.object({
        rating: z2.number().min(1).max(5),
        comment: z2.string().optional()
      });
      const result = ratingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid rating data", errors: result.error.errors });
      }
      const { rating, comment } = result.data;
      const userId = 1;
      await storage.rateWallet(address, userId, rating, comment);
      res.json({ message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Error submitting rating:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });
  app2.post("/api/wallet/:address/flag", async (req, res) => {
    try {
      const { address } = req.params;
      const flagSchema = z2.object({
        reason: z2.string().min(1)
      });
      const result = flagSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid flag data", errors: result.error.errors });
      }
      const { reason } = result.data;
      const userId = 1;
      await storage.flagWallet(address, userId, reason);
      res.json({ message: "Wallet flagged successfully" });
    } catch (error) {
      console.error("Error flagging wallet:", error);
      res.status(500).json({ message: "Failed to flag wallet" });
    }
  });
  app2.post("/api/wallet/:address/report", async (req, res) => {
    try {
      const { address } = req.params;
      const reportSchema = z2.object({
        category: z2.enum([
          ReportCategory.SCAM,
          ReportCategory.PHISHING,
          ReportCategory.ILLEGAL,
          ReportCategory.SUSPICIOUS,
          ReportCategory.SPAM,
          ReportCategory.OTHER
        ]),
        reason: z2.string().min(1)
      });
      const result = reportSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid report data", errors: result.error.errors });
      }
      const { category, reason } = result.data;
      const userId = 1;
      await storage.reportWallet(address, userId, category, reason);
      res.json({ message: "Wallet reported successfully" });
    } catch (error) {
      console.error("Error reporting wallet:", error);
      res.status(500).json({ message: "Failed to report wallet" });
    }
  });
  app2.get("/api/wallet/:address/reports", async (req, res) => {
    try {
      const { address } = req.params;
      const reports = await storage.getWalletReports(address);
      res.json({
        count: reports.count,
        reports: reports.reports.map((report) => ({
          category: report.category,
          reason: report.reason,
          createdAt: report.createdAt.toISOString()
        })),
        categoryCounts: reports.categoryCounts
      });
    } catch (error) {
      console.error("Error getting wallet reports:", error);
      res.status(500).json({ message: "Failed to fetch wallet reports" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(
    5e3,
    "127.0.0.1",
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
