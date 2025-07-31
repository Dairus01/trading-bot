import React, { useState } from "react";
import DataTable from "./DataTable";
// import { dummyData } from "./dummyData";
import { getColumns } from "./Columns";
import { useGetTransactionHistoryQuery } from "@/services/transactionApi";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const TransactionHistoryTable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 5, //default page size
  });

  const columns = getColumns();

  const {
    data: getTransactionHistoryData,
    isLoading: getTransactionHistoryIsLoading,
    isFetching: getTransactionHistoryIsFetching,
    error: getTransactionHistoryError,
    refetch,
  } = useGetTransactionHistoryQuery({
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <div className="flex justify-end w-full pb-4">
        <Button
          className="text-purple-600 hover:text-purple-400 border-purple-500/30 cursor-pointer"
          onClick={handleRefresh}
        >
          <span>
            <RefreshCcw />
          </span>
          Refresh
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={getTransactionHistoryData?.data ?? []}
        paginationData={getTransactionHistoryData?.pagination}
        setPagination={setPagination}
        pagination={pagination}
        isFetching={getTransactionHistoryIsFetching}
      />
    </>
  );
};

export default TransactionHistoryTable;
