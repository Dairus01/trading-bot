import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { truncateText } from "@/utility/truncateText";
import { Activity, Copy } from "lucide-react";

export const getColumns = ({ onBuy, onSell, onCopy }) => {
  return [
    {
      accessorKey: "_id",
    },
    {
      accessorKey: "token_address",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Token Address
        </div>
      ),
      cell: ({ row }) => {
        const tokenAddress = row.getValue("token_address");

        return (
          <div className="w-full text-purple-600 flex justify-center items-center">
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    {truncateText(tokenAddress, 6, 10)}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-purple-600">{tokenAddress}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Copy
                onClick={() => onCopy(tokenAddress)}
                className="cursor-pointer text-purple-700"
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "availableToken",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Balance
        </div>
      ),
      cell: ({ row }) => (
        <div className="w-full text-purple-600 text-center">
          {row.getValue("availableToken")}
        </div>
      ),
    },
    {
      id: "action",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center gap-1 border-none whitespace-nowrap font-semibold">
          <Activity className="h-4 w-4" />
          <span>Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const tokenAddress = row.getValue("token_address");
        const balance = row.getValue("availableToken");

        return (
          <div className="w-full flex justify-center items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              className="text-purple-600 w-20 cursor-pointer"
              onClick={() => onBuy(tokenAddress)}
            >
              Buy
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-purple-600 w-20 cursor-pointer"
              onClick={() => onSell(tokenAddress, balance)}
            >
              Sell
            </Button>
          </div>
        );
      },
    },
  ];
};
