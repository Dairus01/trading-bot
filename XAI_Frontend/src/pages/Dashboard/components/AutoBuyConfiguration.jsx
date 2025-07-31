import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Construction, Loader2 } from "lucide-react";
import React from "react";

const AutoBuyConfiguration = ({ data, isLoading }) => {
  return (
    <Card className="min-w-[343px] w-[343px] max-w-full bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
      <CardHeader>
        <CardTitle className="text-gray-800 text-lg leading-1.5">
          Auto Buy Configuration
        </CardTitle>
        <CardDescription className="text-gray-500">
          Auto Buy Configuration Information
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        {!isLoading ? (
          data?.autoBuyAmountOfSol ? (
            <>
              <div className="flex justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-purple-600">
                    LP Burn
                  </h3>
                  <span className="text-lg font-normal text-gray-900">
                    {data?.checkLpBurn ? "True" : "False"}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-purple-600">
                    Owner Renounce
                  </h3>
                  <span className="text-lg font-normal text-gray-900">
                    {data?.OwnershipRenouncedCheck ? "True" : "False"}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-purple-600">
                  Minimum Liquidity
                </h3>
                <span className="text-lg font-normal text-gray-900">
                  {data?.minimunLp}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-purple-600">
                  Amount of SOL
                </h3>
                <span className="text-lg font-normal text-gray-900">
                  {data?.autoBuyAmountOfSol}
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4 mt-4 items-center text-gray-400">
              <Construction className="h-16 w-16" />
              <span className="text-3xl font-light">No Data</span>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center mt-4">
            <Loader2 className="h-14 w-14 text-purple-500/50 animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoBuyConfiguration;
