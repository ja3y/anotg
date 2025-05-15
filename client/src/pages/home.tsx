import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import EducationalSection from "@/components/home/EducationalSection";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>BitTrackr - Bitcoin Wallet Tracker & Reputation System</title>
        <meta name="description" content="Search, monitor, and analyze Bitcoin wallet addresses. View transaction history and contribute to the community by rating wallets and flagging suspicious activity." />
        
        {/* Open Graph tags */}
        <meta property="og:title" content="BitTrackr - Bitcoin Wallet Tracker & Reputation System" />
        <meta property="og:description" content="Search, monitor, and analyze Bitcoin wallet addresses with our powerful blockchain explorer." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bittrackr.com" />
      </Helmet>
      
      <HeroSection />
      <EducationalSection />
    </div>
  );
}
