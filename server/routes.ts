import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { bitcoinApi } from "./services/bitcoin-api";
import { z } from "zod";
import { ReportCategory } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bitcoin wallet endpoints
  app.get("/api/wallet/:address", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Get wallet data from Bitcoin API
      const walletData = await bitcoinApi.getWalletData(address);
      
      // Get reputation data from our storage
      const reputation = await storage.getWalletReputation(address);
      
      // Get flags from our storage
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

  app.get("/api/wallet/:address/transactions", async (req, res) => {
    try {
      const { address } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const filter = req.query.filter as string || "all";
      const sort = req.query.sort as string || "desc";
      
      const transactions = await bitcoinApi.getWalletTransactions(address, {
        page,
        limit,
        filter,
        sort
      });
      
      res.json(transactions);
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

  app.get("/api/wallet/:address/related", async (req, res) => {
    try {
      const { address } = req.params;
      
      const relatedWallets = await bitcoinApi.getRelatedWallets(address);
      
      // Enhance with reputation data from our storage
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

  // Wallet reputation endpoints
  app.post("/api/wallet/:address/rate", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Validate request body
      const ratingSchema = z.object({
        rating: z.number().min(1).max(5),
        comment: z.string().optional()
      });
      
      const result = ratingSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid rating data", errors: result.error.errors });
      }
      
      const { rating, comment } = result.data;
      
      // For demo purposes, we'll use a fixed user ID (would come from auth in a real app)
      const userId = 1;
      
      // Store the rating
      await storage.rateWallet(address, userId, rating, comment);
      
      res.json({ message: "Rating submitted successfully" });
    } catch (error) {
      console.error("Error submitting rating:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });

  // Wallet flagging endpoints
  app.post("/api/wallet/:address/flag", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Validate request body
      const flagSchema = z.object({
        reason: z.string().min(1)
      });
      
      const result = flagSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid flag data", errors: result.error.errors });
      }
      
      const { reason } = result.data;
      
      // For demo purposes, we'll use a fixed user ID (would come from auth in a real app)
      const userId = 1;
      
      // Store the flag
      await storage.flagWallet(address, userId, reason);
      
      res.json({ message: "Wallet flagged successfully" });
    } catch (error) {
      console.error("Error flagging wallet:", error);
      res.status(500).json({ message: "Failed to flag wallet" });
    }
  });

  // Wallet reporting endpoints
  app.post("/api/wallet/:address/report", async (req, res) => {
    try {
      const { address } = req.params;
      
      // Validate request body
      const reportSchema = z.object({
        category: z.enum([
          ReportCategory.SCAM,
          ReportCategory.PHISHING,
          ReportCategory.ILLEGAL,
          ReportCategory.SUSPICIOUS,
          ReportCategory.SPAM,
          ReportCategory.OTHER
        ]),
        reason: z.string().min(1)
      });
      
      const result = reportSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid report data", errors: result.error.errors });
      }
      
      const { category, reason } = result.data;
      
      // For demo purposes, we'll use a fixed user ID (would come from auth in a real app)
      const userId = 1;
      
      // Store the report
      await storage.reportWallet(address, userId, category, reason);
      
      res.json({ message: "Wallet reported successfully" });
    } catch (error) {
      console.error("Error reporting wallet:", error);
      res.status(500).json({ message: "Failed to report wallet" });
    }
  });

  app.get("/api/wallet/:address/reports", async (req, res) => {
    try {
      const { address } = req.params;
      
      const reports = await storage.getWalletReports(address);
      
      res.json({
        count: reports.count,
        reports: reports.reports.map(report => ({
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

  const httpServer = createServer(app);

  return httpServer;
}
