import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TokenHoldingTable from "./components/TokenHoldingTable";

const TokenHolding = () => {
  
  return (
    <>
      <Card className="w-full bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
        <CardHeader>
          <CardTitle className="text-gray-800 text-lg leading-1.5">
            Token Holdings
          </CardTitle>
          <CardDescription className="text-gray-500">
            Token Holdings List
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4">
          <TokenHoldingTable />
        </CardContent>
      </Card>
    </>
  );
};

export default TokenHolding;
