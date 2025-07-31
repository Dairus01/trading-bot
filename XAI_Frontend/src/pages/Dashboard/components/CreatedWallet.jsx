import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { truncateText } from "@/utility/truncateText";
import { Copy, Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const CreatedWallet = ({ data, isLoading }) => {
  const handleCopy = (address) => {
    if (!navigator.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }
    navigator.clipboard
      .writeText(address)
      .then(() => {
        console.log("Copied to clipboard:", address);
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        toast.error("Failed to copy text");
      });
  };

  return (
    <>
      <Card className="min-w-[343px] w-[343px] max-w-full min-h-48 bg-white/10 backdrop:blur-3xl border-white/20 hover:shadow-2xl hover:shadow-purple-600/30 hover:border-purple-500/15 transition-all duration-200 ease-in">
        <CardHeader>
          <CardTitle className="text-gray-800 leading-1.5">
            Created Wallet
          </CardTitle>
          <CardDescription className="text-gray-500">
            Here is your created Wallet Address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-lg font-semibold text-purple-600">
            Wallet Address
          </h3>
          <div className="truncate text-sm font-medium text-gray-900 mt-0.5">
            {isLoading ? (
              <span>
                <Loader2 className="h-5 w-5 text-purple-600/50 animate-spin " />
              </span>
            ) : data?.walletAddress ? (
              <span className="flex items-center gap-1.5">
                {truncateText(data?.walletAddress, 8, 10)}
                <Copy
                  onClick={() => handleCopy(data?.walletAddress)}
                  className="text-purple-600 cursor-pointer"
                />
              </span>
            ) : (
              <span className="text-gray-500">Data Unavailable</span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default CreatedWallet;
