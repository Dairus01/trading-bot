import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import AutoBuySellConfigurationForm from "./components/AutoBuySellConfigurationForm";

const AutoBuySellConfiguration = () => {
  return (
    <>
      <div className="w-full flex flex-col gap-y-10">
        <Header title="Auto Buy & Sell Configuration" />

        <Card className="min-w-[343px] w-full max-w-full min-h-48 bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
          <CardHeader>
            <CardTitle className="text-purple-950 leading-1.5">
              Auto Buy & Sell Configuration
            </CardTitle>
            <CardDescription className="text-gray-500">
              Set up your automated trading strategy with these configuration
              settings. Adjust parameters to manage risk and optimize your
              trading performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutoBuySellConfigurationForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AutoBuySellConfiguration;
