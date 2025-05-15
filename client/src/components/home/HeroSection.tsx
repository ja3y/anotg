import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";

const POPULAR_ADDRESSES = [
  "3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5",
  "1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ"
];

export default function HeroSection() {
  const [searchInput, setSearchInput] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setLocation(`/wallet/${searchInput.trim()}`);
    }
  };

  const handlePopularSearch = (address: string) => {
    setLocation(`/wallet/${address}`);
  };

  return (
    <section className="mb-8 mt-3">
      <Card className="overflow-hidden custom-shadow bg-white dark:bg-[#21222D]">
        <div className="flex flex-col md:flex-row">
          <CardContent className="p-6 md:p-10 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 text-neutral-800 dark:text-white">
              Bitcoin Wallet Intelligence Platform
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-2xl">
              Search and monitor Bitcoin wallet addresses, view transaction history, and contribute to the community by rating wallets and flagging suspicious activity.
            </p>
            
            <form className="flex flex-col md:flex-row gap-3 mb-3" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-neutral-400" />
                </div>
                <Input 
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-700 dark:text-neutral-200 bg-white dark:bg-neutral-800"
                  placeholder="Enter Bitcoin wallet address (e.g. 3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5)" 
                  aria-label="Search wallet address" 
                />
              </div>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white rounded-lg px-5 py-2.5 font-medium transition duration-200"
              >
                Search
              </Button>
            </form>
            
            <div className="flex flex-wrap mt-3 gap-2 text-sm">
              <span className="bg-neutral-100 dark:bg-neutral-700 px-3 py-1 rounded-full">Popular searches:</span>
              {POPULAR_ADDRESSES.map(address => (
                <button
                  key={address}
                  onClick={() => handlePopularSearch(address)}
                  className="text-primary hover:underline bg-primary-light dark:bg-neutral-800 px-3 py-1 rounded-full transition duration-200"
                >
                  {address}
                </button>
              ))}
            </div>
          </CardContent>
          <div className="hidden md:block w-72 lg:w-96 self-end">
            <img 
              src="https://images.unsplash.com/photo-1511871893393-82e9c16b81e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=384&h=384" 
              alt="Bitcoin blockchain visualization" 
              className="h-full w-full object-cover" 
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
