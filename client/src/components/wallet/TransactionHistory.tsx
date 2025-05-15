import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fetchTransactions } from "@/lib/bitcoin-api";
import axios from "axios";

interface Transaction {
  hash: string;
  date: string;
  time: string;
  type: "sent" | "received";
  otherAddress: string;
  amount: number;
  fee: number;
}

interface TransactionResponse {
  transactions: Transaction[];
  page: number;
  limit: number;
  total: number;
}

interface TransactionHistoryProps {
  address: string;
}

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("desc");

  const { data, isLoading, error } = useQuery<TransactionResponse>({
    queryKey: [`/api/wallet/${address}/transactions`, page, limit, filter, sort],
    queryFn: () => fetchTransactions(address, page, limit),
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
      : "We couldn't load the transaction history. Please try again later.";

    return (
      <Card className="bg-white dark:bg-[#21222D] custom-shadow">
        <CardContent className="p-6">
          <div className="text-neutral-800 dark:text-white font-bold">Error loading transactions</div>
          <p className="text-neutral-600 dark:text-neutral-400">
            {errorMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="bg-white dark:bg-[#21222D] custom-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-800 dark:text-white">Transaction History</h2>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          {data.transactions.map((tx) => (
            <div
              key={tx.hash}
              className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  tx.type === "received" 
                    ? "bg-green-100 dark:bg-green-900/20" 
                    : "bg-red-100 dark:bg-red-900/20"
                }`}>
                  {tx.type === "received" ? (
                    <ArrowDownIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowUpIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-neutral-800 dark:text-white">
                    {tx.type === "received" ? "Received from" : "Sent to"}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                    {tx.otherAddress}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  tx.type === "received" 
                    ? "text-green-600 dark:text-green-400" 
                    : "text-red-600 dark:text-red-400"
                }`}>
                  {tx.type === "received" ? "+" : "-"}₿ {tx.amount.toFixed(8)}
                </div>
                <div className="text-sm text-neutral-500 dark:text-neutral-500">
                  {tx.date} {tx.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.total > limit && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page * limit >= data.total}
            >
              Load More
              <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
