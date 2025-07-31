import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WithdrawDialogContent from "./WithdrawDialogContent";

const WithdrawDialog = ({ open, onOpenChange, balance }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-purple-950 border-purple-200/30">
        <DialogHeader>
          <DialogTitle className="text-white">Withdraw SOL Amount</DialogTitle>
          <DialogDescription className="text-white/50">
            Please confirm your withdrawal. Once processed, this transaction
            cannot be reversed. Verify the amount before proceeding.
          </DialogDescription>
        </DialogHeader>

        <WithdrawDialogContent
          close={() => onOpenChange((prev) => !prev)}
          totalSol={balance}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
