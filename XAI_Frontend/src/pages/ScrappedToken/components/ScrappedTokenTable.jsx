import React, { useState } from "react";
import DataTable from "./DataTable";
import { getColumns } from "./Columns";
import { useGetScrappedTokenQuery } from "@/services/transactionApi";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const ScrappedTokenTable = () => {
  const [type, setType] = useState("discord");

  const [pagination, setPagination] = useState({
    pageIndex: 0, //initial page index
    pageSize: 5, //default page size
  });

  const columns = getColumns();

  const {
    data: getScrappedTokenData,
    isLoading: getScrappedTokenIsLoading,
    isFetching: getScrappedTokenIsFetching,
    // error: getScrappedTokenError,
    refetch,
  } = useGetScrappedTokenQuery({
    type,
    skip: pagination.pageIndex * pagination.pageSize,
    limit: pagination.pageSize,
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <div className="flex justify-end w-full pb-4 gap-4">
        {getScrappedTokenIsLoading ? (
          <>
            <Skeleton className="w-32 h-10 rounded-md" />
            <Skeleton className="w-24 h-10 rounded-md" />
          </>
        ) : (
          <>
            <Select defaultValue={type} onValueChange={setType}>
              <SelectTrigger className="w-32 text-purple-600">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent className="text-purple-600">
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="sniper">Sniper</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="text-purple-600 hover:text-purple-400 border-purple-500/30 cursor-pointer"
              onClick={handleRefresh}
            >
              <RefreshCcw className="mr-1" />
              Refresh
            </Button>
          </>
        )}
      </div>
      <DataTable
        columns={columns}
        data={getScrappedTokenData?.data ?? []}
        paginationData={getScrappedTokenData?.pagination}
        setPagination={setPagination}
        pagination={pagination}
        isFetching={getScrappedTokenIsFetching}
      />
    </>
  );
};

export default ScrappedTokenTable;
