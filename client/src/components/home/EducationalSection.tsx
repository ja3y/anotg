import { Card, CardContent } from "@/components/ui/card";
import { Shield, SearchIcon, Users, History } from "lucide-react";

export default function EducationalSection() {
  return (
    <section className="mb-8">
      <Card className="overflow-hidden custom-shadow bg-white dark:bg-[#21222D]">
        <CardContent className="px-6 py-6 lg:px-8">
          <h2 className="text-xl lg:text-2xl font-bold mb-4 text-neutral-800 dark:text-white">
            Learn About Bitcoin Wallet Security
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                Understanding blockchain transactions and wallet security is crucial for safely navigating the cryptocurrency ecosystem. Our platform helps you identify suspicious patterns and maintain awareness of potential risks.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-neutral-800 dark:text-white">Security Indicators</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Learn how to identify warning signs and security indicators for Bitcoin addresses.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                    <SearchIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-neutral-800 dark:text-white">Transaction Patterns</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Understand common transaction patterns associated with various activities.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-neutral-800 dark:text-white">Community Verification</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">How our community-driven reputation system helps identify trustworthy wallets.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light dark:bg-primary/20 flex items-center justify-center text-primary">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-neutral-800 dark:text-white">Transaction History</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Learn how to analyze transaction history to make informed decisions.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block relative">
              <img 
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=500" 
                alt="Bitcoin security concept" 
                className="rounded-lg h-full w-full object-cover" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
