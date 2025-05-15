import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Ban, Shield, AlertTriangle } from "lucide-react";
import { flagWallet } from "@/lib/bitcoin-api";
import { useToast } from "@/hooks/use-toast";

interface FlagWalletProps {
  address: string;
}

export default function FlagWallet({ address }: FlagWalletProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const flagWalletMutation = useMutation({
    mutationFn: (reason: string) => flagWallet(address, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/wallet/${address}`],
      });
      toast({
        title: "Wallet flagged",
        description: "Thank you for your contribution to the community.",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to flag wallet. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleFlag = (reason: string) => {
    flagWalletMutation.mutate(reason);
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
      <h3 className="text-md font-medium text-neutral-800 dark:text-white mb-3">Flag This Wallet</h3>
      <div className="space-y-2">
        <Button
          variant="outline"
          onClick={() => handleFlag("scam")}
          disabled={flagWalletMutation.isPending}
          className="w-full justify-start px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition duration-200"
        >
          <Ban className="h-4 w-4 text-[#F44336] mr-2" />
          <span>Scam or Fraud</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFlag("illegal")}
          disabled={flagWalletMutation.isPending}
          className="w-full justify-start px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition duration-200"
        >
          <Shield className="h-4 w-4 text-[#F44336] mr-2" />
          <span>Illegal Activity</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFlag("phishing")}
          disabled={flagWalletMutation.isPending}
          className="w-full justify-start px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition duration-200"
        >
          <AlertTriangle className="h-4 w-4 text-[#F44336] mr-2" />
          <span>Phishing or Hacking</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFlag("suspicious")}
          disabled={flagWalletMutation.isPending}
          className="w-full justify-start px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition duration-200"
        >
          <AlertTriangle className="h-4 w-4 text-[#FFC107] mr-2" />
          <span>Suspicious Pattern</span>
        </Button>
      </div>
    </div>
  );
}
