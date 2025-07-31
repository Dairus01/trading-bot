import Header from "@/components/Header";
import React from "react";
import TransactionHistoryTable from "./components/TransactionHistoryTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TransactionHistory = () => {
  return (
    <>
      <div className="w-full flex flex-col gap-y-10">
        <Header title="Transaction History" />

        <Card className="w-full min-h-48 bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
          <CardHeader>
            <CardTitle className="text-purple-950 leading-1.5">
              Transaction History
            </CardTitle>
            <CardDescription className="text-gray-500">
              View a comprehensive record of your past transactions. Monitor
              your buys, sells, and transfers all in one place to track
              performance and review your trading activity over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionHistoryTable />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TransactionHistory;
