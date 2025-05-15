import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { name: "Wallets", path: "/wallets", icon: "ri-wallet-3-line" },
    { name: "Transactions", path: "/transactions", icon: "ri-exchange-funds-line" },
    { name: "Reports", path: "/reports", icon: "ri-file-chart-line" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#21222D] border-t border-neutral-200 dark:border-neutral-700 z-30">
      <div className="grid grid-cols-4">
        {navItems.map(item => (
          <Link key={item.path} href={item.path}>
            <a className={cn(
              "flex flex-col items-center justify-center py-2",
              location === item.path 
                ? "text-primary border-t-2 border-primary" 
                : "text-neutral-500 dark:text-neutral-400"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                {item.icon === "ri-dashboard-line" && (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                )}
                {item.icon === "ri-wallet-3-line" && (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                )}
                {item.icon === "ri-exchange-funds-line" && (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                )}
                {item.icon === "ri-file-chart-line" && (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </>
                )}
              </svg>
              <span className="text-xs mt-1">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
