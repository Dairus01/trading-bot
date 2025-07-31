import { ROUTES } from "@/routes/routes";
import { ArrowRightLeft, CalendarSync, Coins, History, Home, Settings } from "lucide-react";

export const sidebarData = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: Home,
  },
  {
    title: "Quick Buy/Sell",
    url: ROUTES.QUICK_BUY_SELL,
    icon: ArrowRightLeft,
  },
  {
    title: "Auto Buy & Sell Configuration",
    url: ROUTES.AUTO_BUY_SELL_CONFIGURATION,
    icon: CalendarSync,
  },
  {
    title: "Transaction Settings",
    url: ROUTES.TRANSACTION_SETTINGS,
    icon: Settings,
  },
  {
    title: "Transaction History",
    url: ROUTES.TRANSACTION_HISTORY,
    icon: History,
  },
  {
    title: "Scrapped Token",
    url: ROUTES.SCRAPPED_TOKEN,
    icon: Coins,
  },
];
