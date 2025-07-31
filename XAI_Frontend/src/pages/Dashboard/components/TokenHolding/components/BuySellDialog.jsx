import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BuyDialogContent from "./BuyDialogContent";
import SellDialogContent from "./SellDialogContent";

const BuySellDialog = ({ 
  open,
  onOpenChange,
  action,
  tokenAddress,
  balance,
}) => {
  const title = action === "buy" ? "Buy Token" : "Sell Token";
  const description =
    action === "buy"
      ? "Please confirm your purchase. Once processed, the tokens will be added to your account."
      : "Please confirm your sale. Once processed, the tokens will be deducted from your account.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-purple-950 border-purple-200/30">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription className="text-white/50">
            {description}
          </DialogDescription>
        </DialogHeader>

        {action == "buy" && (
          <BuyDialogContent
            tokenAddress={tokenAddress}
            close={() => onOpenChange((prev) => !prev)}
          />
        )}

        {action == "sell" && (
          <SellDialogContent
            tokenAddress={tokenAddress}
            balance={balance}
            close={() => onOpenChange((prev) => !prev)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BuySellDialog;
