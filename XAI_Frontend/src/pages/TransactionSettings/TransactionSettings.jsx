import Header from "@/components/Header";
import React from "react";
import TransactionSettingsForm from "./components/TransactionSettingsForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TransactionSettings = () => {
  return (
    <>
      <div className="w-full flex flex-col gap-y-10">
        <Header title="Transaction Settings" />

        <Card className="min-w-[343px] w-[543px] max-w-full min-h-48 bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
          <CardHeader>
            <CardTitle className="text-purple-950 leading-1.5">
              Transaction Settings
            </CardTitle>
            <CardDescription className="text-gray-500">
              Customize your blockchain transaction parameters to optimize both
              speed and cost. Adjust the gas priority fee to control how fast
              your transaction is processed and set a slippage limit to protect
              against market volatility.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionSettingsForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TransactionSettings;
