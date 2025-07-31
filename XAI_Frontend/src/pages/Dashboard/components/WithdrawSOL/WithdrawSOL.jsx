import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import WithdrawDialog from "./components/WithdrawDialog";
import { Loader2 } from "lucide-react";

const WithdrawSOL = ({ data, isLoading }) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const toggleWithdrawDialog = () => {
    setIsWithdrawOpen((prev) => !prev);
  };

  return (
    <>
      <Card className="min-w-[343px] w-[343px] max-w-full bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
        <CardHeader>
          <CardTitle className="text-gray-800 leading-1.5">
            Withdraw SOL
          </CardTitle>
          <CardDescription className="text-gray-500">
            Withdraw SOL Information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-base font-semibold text-purple-600">
              Total SOL
            </h3>
            <div className="text-lg font-normal text-gray-900">
              {isLoading ? (
                <span>
                  <Loader2 className="h-5 w-5 text-purple-600/50 animate-spin " />
                </span>
              ) : (
                data?.balance || "0"
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={toggleWithdrawDialog}
            type="button"
            disabled={
              isLoading || data?.balance === undefined || !(data?.balance > 0)
            }
            className="w-full text-purple-600 cursor-pointer"
          >
            Withdraw
          </Button>
        </CardFooter>
      </Card>

      <WithdrawDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        balance={data?.balance}
      />
    </>
  );
};

export default WithdrawSOL;
