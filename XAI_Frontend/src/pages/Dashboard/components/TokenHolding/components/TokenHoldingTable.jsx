import React, { useRef, useState } from "react";
import DataTable from "./DataTable";
import { getColumns } from "./Columns";
import { dummyData } from "./dummyData";
import { toast } from "sonner";
import BuySellDialog from "./BuySellDialog";
import { useGetTokenHoldingsQuery } from "@/services/transactionApi";

const TokenHoldingTable = () => {
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 5, //default page size
  });

  const buyRef = useRef({ tokenAddress: null });
  const sellRef = useRef({ tokenAddress: null, balance: null });

  const {
    data: getTokenHoldingData,
    isLoading: getTokenHoldingIsLoading,
    isFetching: getTokenHoldingIsFetching,
    error: getTokenHoldingError,
  } = useGetTokenHoldingsQuery({
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  });

  console.log("getTokenHoldingData-->", getTokenHoldingData);

  const handleBuy = (tokenAddress) => {
    console.log("handleBuy, Buy token:", tokenAddress);
    // Update the ref with the selected token address
    buyRef.current.tokenAddress = tokenAddress;
    // Open the buy dialog (this state change triggers a re-render)
    setIsBuyDialogOpen((prev) => !prev);
  };

  const handleSell = (tokenAddress, balance) => {
    console.log(
      "handleSell, Sell token:",
      tokenAddress,
      "handleSell, Balance:",
      balance
    );
    // Update the ref with the selected token details
    sellRef.current.tokenAddress = tokenAddress;
    sellRef.current.balance = balance;
    // Open the sell dialog (this state change triggers a re-render)
    setIsSellDialogOpen((prev) => !prev);
  };

  const handleCopy = (tokenAddress) => {
    if (!navigator.clipboard) {
      console.warn("Clipboard not supported");
      return;
    }
    navigator.clipboard
      .writeText(tokenAddress)
      .then(() => {
        console.log("Copied to clipboard:", tokenAddress);
        toast.success("Copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        toast.error("Failed to copy text");
      });
  };

  const columns = getColumns({
    onBuy: handleBuy,
    onSell: handleSell,
    onCopy: handleCopy,
  });

  return (
    <>
      <DataTable
        columns={columns}
        data={getTokenHoldingData?.data ?? []}
        paginationData={getTokenHoldingData?.pagination}
        setPagination={setPagination}
        pagination={pagination}
        isFetching={getTokenHoldingIsFetching}
      />

      <BuySellDialog
        open={isBuyDialogOpen}
        onOpenChange={setIsBuyDialogOpen}
        action="buy"
        tokenAddress={buyRef.current?.tokenAddress}
      />

      <BuySellDialog
        open={isSellDialogOpen}
        onOpenChange={setIsSellDialogOpen}
        action="sell"
        tokenAddress={sellRef.current?.tokenAddress}
        balance={sellRef.current?.balance}
      />
    </>
  );
};

export default TokenHoldingTable;
