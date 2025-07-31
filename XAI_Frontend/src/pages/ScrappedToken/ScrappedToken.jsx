import Header from "@/components/Header";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ScrappedTokenTable from "./components/ScrappedTokenTable";

const ScrappedToken = () => {
  return (
    <>
      <div className="w-full flex flex-col gap-y-10">
        <Header title="Scrapped Token" />

        <Card className="w-full min-h-48 bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
          <CardHeader>
            <CardTitle className="text-purple-950 leading-1.5">
              Scrapped Token
            </CardTitle>
            <CardDescription className="text-gray-500">
              Live-scraped token insights—including price, liquidity and
              market-cap metrics—from multiple chains, updated in real time via
              on-chain APIs. Ideal for spotting emerging crypto assets and
              tracking their performance at a glance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrappedTokenTable />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ScrappedToken;
