import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stars } from "@/components/ui/stars";
import { ChevronRightIcon } from "lucide-react";
import { fetchRelatedWallets } from "@/lib/bitcoin-api";
import axios from "axios";

interface RelatedWallet {
  address: string;
  balance: string;
  transactionCount: number;
  rating: number;
  flagged: boolean;
}

interface RelatedWalletsResponse {
  wallets: RelatedWallet[];
}

interface RelatedWalletsProps {
  address: string;
}

export default function RelatedWallets({ address }: RelatedWalletsProps) {
  const { data, isLoading, error } = useQuery<RelatedWalletsResponse>({
    queryKey: [`/api/wallet/${address}/related`],
    queryFn: () => fetchRelatedWallets(address),
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-[#21222D] custom-shadow">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
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
      : "We couldn't load the related wallets. Please try again later.";

    return (
      <Card className="bg-white dark:bg-[#21222D] custom-shadow">
        <CardContent className="p-6">
          <div className="text-neutral-800 dark:text-white font-bold">Error loading related wallets</div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {errorMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.wallets.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#21222D] custom-shadow">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">Related Wallets</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            No related wallets found for this address.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#21222D] custom-shadow">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">Related Wallets</h2>
        
        <div className="space-y-3">
          {data.wallets.map((wallet) => (
            <Link key={wallet.address} href={`/wallet/${wallet.address}`}>
              <a className={`wallet-card block border ${
                wallet.flagged 
                  ? 'border-warning/30 bg-warning/5 dark:border-warning/20 dark:bg-warning/5' 
                  : 'border-neutral-200 dark:border-neutral-700'
              } rounded-lg p-4 hover:shadow-md transition-all duration-200`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-mono text-sm truncate-address">{wallet.address}</div>
                  {wallet.flagged ? (
                    <Badge variant="flagged">Flagged</Badge>
                  ) : (
                    <Stars rating={wallet.rating} readOnly size="sm" />
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <div className="text-neutral-600 dark:text-neutral-400">Balance: ₿ {wallet.balance}</div>
                  <div className="text-neutral-500 dark:text-neutral-500">{wallet.transactionCount} transactions</div>
                </div>
              </a>
            </Link>
          ))}
        </div>
        
        <div className="mt-4">
          <Link href={`/wallet/${address}/related`}>
            <a className="text-primary hover:underline text-sm flex items-center justify-center">
              View all related wallets <ChevronRightIcon className="h-4 w-4 ml-1" />
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
