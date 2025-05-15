import { Link } from "wouter";
import { useTheme } from "../ThemeProvider";
import { Button } from "@/components/ui/button";
import {
  SunIcon,
  MoonIcon,
  User2Icon,
} from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#21222D] shadow-sm border-b border-neutral-200 dark:border-neutral-700">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-[#F7931A]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
              <span className="font-semibold text-xl tracking-tight">BitTrackr</span>
            </a>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Link href="/">
            <a className="px-3 py-2 rounded-md text-sm font-medium text-primary hover:bg-primary-light hover:text-primary-hover dark:hover:bg-neutral-700 transition-colors duration-200">
              Dashboard
            </a>
          </Link>
          <Link href="/wallets">
            <a className="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors duration-200">
              Wallets
            </a>
          </Link>
          <Link href="/transactions">
            <a className="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors duration-200">
              Transactions
            </a>
          </Link>
          <Link href="/reports">
            <a className="px-3 py-2 rounded-md text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 transition-colors duration-200">
              Reports
            </a>
          </Link>
        </nav>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          
          <div className="relative hidden md:block">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              <User2Icon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
