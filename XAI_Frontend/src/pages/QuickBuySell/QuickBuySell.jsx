import Header from "@/components/Header";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuickSell from "./components/QuickSell";
import QuickBuy from "./components/QuickBuy";

const QuickBuySell = () => {
  return (
    <>
      <div className="w-full flex flex-col gap-y-10">
        <Header title="Quick Buy/Sell" />
        <div className="w-full flex justify-center">
          <Tabs defaultValue="quickBuy" className="w-full">
            <TabsList className="text-gray-600/50">
              <TabsTrigger
                value="quickBuy"
                className="data-[state=active]:text-purple-600"
              >
                Quick Buy
              </TabsTrigger>
              <TabsTrigger
                value="quickSell"
                className="data-[state=active]:text-purple-600"
              >
                Quick Sell
              </TabsTrigger>
            </TabsList>
            <TabsContent value="quickBuy">
              <QuickBuy />
            </TabsContent>
            <TabsContent value="quickSell">
              <QuickSell />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default QuickBuySell;
