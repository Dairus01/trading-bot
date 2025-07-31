import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import QuickBuyForm from "./QuickBuyForm";

const QuickBuy = () => {
  return (
    <Card className="min-w-[343px] w-[543px] max-w-full min-h-48 bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
      <CardHeader>
        <CardTitle className="text-purple-950 leading-1.5">Quick Buy</CardTitle>
        <CardDescription className="text-gray-500">
          Purchase tokens quickly and easily. Simply enter the token address and
          the amount you wish to buy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QuickBuyForm />
      </CardContent>
    </Card>
  );
};

export default QuickBuy;
