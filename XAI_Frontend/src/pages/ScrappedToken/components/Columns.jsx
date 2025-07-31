import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncateText } from "@/utility/truncateText";
import { CheckCircle, Copy, XCircle } from "lucide-react";
import { toast } from "sonner";

export const getColumns = () => {
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

  return [
    {
      accessorKey: "_id",
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Status
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status").toLowerCase();

        return (
          <div className="w-full flex justify-center items-center">
            <div className="flex items-center gap-1.5">
              {status === "failed" ? (
                <>
                  <span className="text-red-500">Failed</span>
                  <XCircle className="h-4 w-4 text-red-500" />
                </>
              ) : (
                <>
                  <span className="text-green-500">Success</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tokenAddress",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Token Address
        </div>
      ),
      cell: ({ row }) => {
        const tokenAddress = row.getValue("tokenAddress");

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
                onClick={() => handleCopy(tokenAddress)}
                className="cursor-pointer text-purple-700"
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "poolId",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Pool ID
        </div>
      ),
      cell: ({ row }) => {
        const poolId = row.getValue("poolId");

        return (
          <div className="w-full text-purple-600 flex justify-center items-center">
            <div className="flex items-center gap-1.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>{truncateText(poolId, 6, 10)}</TooltipTrigger>
                  <TooltipContent>
                    <p className="text-purple-600">{poolId}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Copy
                onClick={() => handleCopy(poolId)}
                className="cursor-pointer text-purple-700"
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "platform",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Platform
        </div>
      ),
      cell: ({ row }) => {
        const platform = row.getValue("platform");

        return (
          <div className="w-full flex justify-center items-center capitalize">
            {platform}
          </div>
        );
      },
    },
  ];
};
