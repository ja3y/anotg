import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyIcon, ShareIcon, BookmarkIcon, AlertTriangleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Stars } from "@/components/ui/stars";
import { fetchWalletData } from "@/lib/bitcoin-api";
import axios from "axios";

interface WalletData {
  address: string;
  balance: {
    btc: number;
    usd: number;
  };
  transactions: {
    count: number;
    firstDate: string;
  };
  reputation: {
    score: number;
    reviews: number;
  };
  flags: Array<{
    type: string;
    title: string;
    description: string;
  }>;
}

interface WalletOverviewProps {
  address: string;
}

export default function WalletOverview({ address }: WalletOverviewProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const { data: wallet, isLoading, error } = useQuery<WalletData>({
    queryKey: [`/api/wallet/${address}`],
    refetchOnWindowFocus: false,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    setIsCopied(true);
    toast({
      title: "Address copied to clipboard",
      description: "The wallet address has been copied to your clipboard.",
      duration: 2000,
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Card className="mb-6 bg-white dark:bg-[#21222D] custom-shadow">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                  <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded mb-2"></div>
                  <div className="h-5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded mb-1"></div>
                  <div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    const errorMessage = axios.isAxiosError(error) && error.response?.status === 400
      ? "Invalid Bitcoin address format"
      : axios.isAxiosError(error) && error.response?.status === 404
      ? "Wallet address not found on the blockchain"
      : "We couldn't load the information for this wallet. Please try again later.";

    return (
      <Card className="mb-6 bg-white dark:bg-[#21222D] custom-shadow">
        <CardContent className="p-6">
          <div className="text-neutral-800 dark:text-white font-bold">Error loading wallet data</div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {errorMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return null;
  }

  return (
    <Card className="mb-6 bg-white dark:bg-[#21222D] custom-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Wallet Overview</h2>
            <div className="flex items-center mt-2">
              <span className="font-mono text-sm text-neutral-600 dark:text-neutral-300 truncate-address">
                {address}
              </span>
              <button 
                className="ml-2 text-primary"
                onClick={copyToClipboard}
                title="Copy address"
              >
                <CopyIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-1 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700">
              <BookmarkIcon className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Balance</div>
            <div className="text-xl font-bold text-neutral-800 dark:text-white mb-1">
              ₿ {wallet.balance.btc.toFixed(4)}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-500">
              ${wallet.balance.usd.toLocaleString()}
            </div>
          </div>
          
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Transactions</div>
            <div className="text-xl font-bold text-neutral-800 dark:text-white mb-1">
              {wallet.transactions.count.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-500">
              First seen: {wallet.transactions.firstDate}
            </div>
          </div>
          
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Reputation</div>
            <div className="flex items-center mb-1">
              <Stars rating={wallet.reputation.score} readOnly size="sm" />
              <span className="ml-2 text-neutral-800 dark:text-white">
                {wallet.reputation.score.toFixed(1)}
              </span>
            </div>
            <div className="text-sm text-neutral-500 dark:text-neutral-500">
              {wallet.reputation.reviews} reviews
            </div>
          </div>
        </div>
        
        {wallet.flags.length > 0 && (
          <div className="space-y-2">
            {wallet.flags.map((flag, index) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <AlertTriangleIcon className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-warning">{flag.title}</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">{flag.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
