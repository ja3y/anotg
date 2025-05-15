import axios from "axios";
import { createHash } from "crypto";
import Bottleneck from "bottleneck";

interface WalletData {
  address: string;
  balance: number;
  balanceUsd: number;
  transactions: number;
  firstSeen: string;
}

interface Transaction {
  hash: string;
  time: number;
  amount: number;
  type: 'incoming' | 'outgoing';
}

interface RelatedWallet {
  address: string;
  balance: number;
  transactions: number;
  isFlagged: boolean;
}

interface TransactionOptions {
  page?: number;
  limit?: number;
  filter?: string;
  sort?: string;
}

interface RawWalletData {
  address: string;
  final_balance: number;
  n_tx: number;
  txs: Array<{
    hash: string;
    time: number;
    result: number;
    inputs: Array<{
      prev_out: {
        addr: string;
      };
    }>;
    out: Array<{
      addr: string;
    }>;
  }>;
}

interface RawTickerData {
  USD: {
    last: number;
  };
}

export class BitcoinApi {
  private baseUrl = "https://blockchain.info";
  private apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private readonly MAX_WAIT_TIME = 60 * 1000; // Maximum 1 minute wait
  private limiter: Bottleneck;

  constructor() {
    this.apiKey = process.env.BLOCKCHAIN_API_KEY || "";
    if (!this.apiKey) {
      console.warn("Warning: BLOCKCHAIN_API_KEY not set in environment variables");
    }

    // Initialize rate limiter with more conservative settings
    this.limiter = new Bottleneck({
      reservoir: 15, // Reduced from 30 to 15
      reservoirRefreshAmount: 15,
      reservoirRefreshInterval: 60 * 1000, // Refresh every minute
      maxConcurrent: 1,
      minTime: 4000, // Increased from 2000 to 4000 (4 seconds between requests)
      trackDoneStatus: true,
      highWater: 0, // No queuing
      strategy: Bottleneck.strategy.BLOCK
    });

    // Add event listeners for better monitoring
    this.limiter.on("failed", (error: Error, jobInfo: any) => {
      console.error(`Request failed: ${error.message}`);
      console.log(`Job info:`, jobInfo);
    });

    this.limiter.on("done", (jobInfo: any) => {
      console.log(`Request completed successfully:`, jobInfo);
    });
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string> = {}, retryCount = 0): Promise<T> {
    const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
    const cachedData = this.cache.get(cacheKey);
    const now = Date.now();

    // Check cache first
    if (cachedData && now - cachedData.timestamp < this.CACHE_DURATION) {
      return cachedData.data as T;
    }

    try {
      const response = await this.limiter.schedule(async () => {
        try {
          const res = await axios.get(`${this.baseUrl}${endpoint}`, {
            params: {
              ...params,
              api_code: this.apiKey
            },
            timeout: 10000, // 10 second timeout
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'BitTrackr/1.0'
            }
          });
          return res;
        } catch (error: any) {
          if (error.response?.status === 429) {
            // If we get a 429, wait for the retry-after header or use a default
            const retryAfter = parseInt(error.response.headers['retry-after'] || '60');
            console.log(`Rate limited by API. Waiting ${retryAfter} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            throw error; // Let the limiter handle the retry
          }
          throw error;
        }
      });

      this.cache.set(cacheKey, { data: response.data, timestamp: now });
      return response.data as T;
    } catch (error: any) {
      if (error.response?.status === 429 && retryCount < this.MAX_RETRIES) {
        // Exponential backoff with jitter
        const baseDelay = Math.min(2000 * Math.pow(2, retryCount), this.MAX_WAIT_TIME);
        const jitter = Math.random() * 2000;
        const waitTime = Math.min(
          baseDelay + jitter,
          this.MAX_WAIT_TIME
        );
        
        console.log(`Rate limited. Retry ${retryCount + 1}/${this.MAX_RETRIES}. Waiting ${Math.ceil(waitTime / 1000)} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.makeRequest<T>(endpoint, params, retryCount + 1);
      }
      throw error;
    }
  }

  private validateBitcoinAddress(address: string): boolean {
    const patterns = {
      legacy: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
      segwit: /^bc1[ac-hj-np-z02-9]{11,71}$/,
      p2sh: /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/
    };

    return Object.values(patterns).some(pattern => pattern.test(address));
  }

  private async fetchBTCPrice(): Promise<number> {
    try {
      const data = await this.makeRequest<RawTickerData>("/ticker");
      return data.USD.last;
    } catch (error) {
      console.error("Error fetching BTC price:", error);
      return 0;
    }
  }

  async getWalletData(address: string): Promise<WalletData> {
    if (!this.validateBitcoinAddress(address)) {
      throw new Error('Invalid Bitcoin address format');
    }

    try {
      const data = await this.makeRequest<RawWalletData>(`/rawaddr/${address}`);
      const btcPrice = await this.fetchBTCPrice();

      return {
        address: data.address,
        balance: data.final_balance / 100000000, // Convert satoshis to BTC
        balanceUsd: (data.final_balance / 100000000) * btcPrice,
        transactions: data.n_tx,
        firstSeen: new Date(data.txs[data.txs.length - 1]?.time * 1000).toISOString()
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Wallet address not found');
      }
      throw error;
    }
  }

  async getWalletTransactions(address: string, options: TransactionOptions = {}) {
    try {
      const { page = 1, limit = 10, filter = "all", sort = "desc" } = options;

      if (!this.validateBitcoinAddress(address)) {
        throw new Error("Invalid Bitcoin address format");
      }

      const data = await this.makeRequest<RawWalletData>(`/rawaddr/${address}`, {
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString()
      });
      
      // Apply filtering and sorting
      let filteredTransactions = data.txs;
      if (filter !== "all") {
        filteredTransactions = data.txs.filter(tx => 
          tx.inputs.some((input: any) => input.prev_out.addr === address) === (filter === "sent")
        );
      }

      if (sort === "asc") {
        filteredTransactions.reverse();
      }

      return {
        transactions: filteredTransactions.map(tx => ({
          hash: tx.hash,
          time: tx.time,
          amount: tx.result / 100000000, // Convert satoshis to BTC
          type: tx.result > 0 ? 'incoming' : 'outgoing'
        })),
        page,
        limit,
        total: data.n_tx
      };
    } catch (error) {
      console.error('Error in getWalletTransactions:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to fetch transactions");
    }
  }

  async getRelatedWallets(address: string): Promise<RelatedWallet[]> {
    if (!this.validateBitcoinAddress(address)) {
      throw new Error('Invalid Bitcoin address format');
    }

    try {
      const data = await this.makeRequest<RawWalletData>(`/rawaddr/${address}`, { limit: '50' });
      const relatedAddresses = new Set<string>();

      // Extract related addresses from recent transactions
      data.txs.forEach((tx: any) => {
        tx.inputs.forEach((input: any) => {
          if (input.prev_out?.addr && input.prev_out.addr !== address) {
            relatedAddresses.add(input.prev_out.addr);
          }
        });
        tx.out.forEach((output: any) => {
          if (output.addr && output.addr !== address) {
            relatedAddresses.add(output.addr);
          }
        });
      });

      // Get basic info for each related address (limit to 5 to avoid rate limits)
      const relatedWallets: RelatedWallet[] = [];
      const addressesToProcess = Array.from(relatedAddresses).slice(0, 5);
      
      for (const addr of addressesToProcess) {
        try {
          const walletData = await this.getWalletData(addr);
          relatedWallets.push({
            address: addr,
            balance: walletData.balance,
            transactions: walletData.transactions,
            isFlagged: false // This would need to be implemented with your database
          });
        } catch (error) {
          console.error(`Error fetching data for related wallet ${addr}:`, error);
        }
      }

      return relatedWallets;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Wallet address not found');
      }
      throw error;
    }
  }
}

export const bitcoinApi = new BitcoinApi();
