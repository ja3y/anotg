import { useEffect } from "react";
import { useRoute } from "wouter";
import { Helmet } from "react-helmet";
import WalletOverview from "@/components/wallet/WalletOverview";
import TransactionHistory from "@/components/wallet/TransactionHistory";
import RatingForm from "@/components/wallet/RatingForm";
import FlagWallet from "@/components/wallet/FlagWallet";
import RelatedWallets from "@/components/wallet/RelatedWallets";

export default function WalletPage() {
  const [match, params] = useRoute("/wallet/:address");
  const { address } = params || { address: "" };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [address]);

  if (!match || !address) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">Invalid Wallet Address</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            The wallet address provided is invalid or missing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6" id="wallet-dashboard">
      <Helmet>
        <title>Wallet {address.slice(0, 8)}... - BitTrackr</title>
        <meta name="description" content={`View details, transaction history, and reputation for Bitcoin wallet address ${address}. Analyze wallet activity and see community ratings.`} />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={`Wallet ${address.slice(0, 8)}... - BitTrackr`} />
        <meta property="og:description" content={`View details, transaction history, and reputation for Bitcoin wallet address ${address}. Analyze wallet activity and see community ratings.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://bittrackr.com/wallet/${address}`} />
      </Helmet>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Wallet Overview and Transaction History */}
        <div className="w-full lg:w-2/3 order-2 lg:order-1">
          <WalletOverview address={address} />
          <TransactionHistory address={address} />
        </div>
        
        {/* Sidebar */}
        <div className="w-full lg:w-1/3 order-1 lg:order-2">
          <RatingForm address={address} />
          <RelatedWallets address={address} />
        </div>
      </div>
    </div>
  );
}
