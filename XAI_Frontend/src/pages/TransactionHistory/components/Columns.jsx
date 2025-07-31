import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { truncateText } from "@/utility/truncateText";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Copy,
  Hash,
  MinusCircle,
  XCircle,
} from "lucide-react";
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

  const handleNavigation = (hash) => {
    window.open(`https://solscan.io/tx/${hash}`, "_blank");
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
              {status === "fail" ? (
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
                onClick={() => handleCopy(tokenAddress)}
                className="cursor-pointer text-purple-700"
              />
            </div>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "in_amount",
    //   header: () => (
    //     <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
    //       In Amount
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="w-full text-purple-600 text-center">
    //       {row.getValue("in_amount")}
    //     </div>
    //   ),
    // },
    // {
    //   accessorKey: "out_amount",
    //   header: () => (
    //     <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
    //       Out Amount
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="w-full text-purple-600 text-center">
    //       {row.getValue("out_amount")}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "updatedAt",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          Updated At
        </div>
      ),
      cell: ({ row }) => {
        const updatedAt = row.getValue("updatedAt");
        const date = new Date(updatedAt);
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        });

        return (
          <div className="w-full flex items-center gap-2 justify-center text-purple-600">
            <Calendar className="h-4 w-4 text-purple-700" />
            <span>{formattedDate}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "signature",
      header: () => (
        <div className="text-purple-800 flex justify-center items-center border-none whitespace-nowrap font-semibold">
          <div className="flex items-center gap-0.5">
            <Hash className="h-4 w-4" /> Transaction Hash
          </div>
        </div>
      ),
      cell: ({ row }) => {
        const transactionHash = row.getValue("signature");

        return (
          <div className="w-full text-purple-600 flex justify-center items-center">
            {transactionHash ? (
              <div className="flex items-center gap-1.5">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {truncateText(transactionHash, 6, 10)}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-purple-600">{transactionHash}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <ArrowUpRight
                  onClick={() => handleNavigation(transactionHash)}
                  className="text-green-500 h-6 w-6 cursor-pointer"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Not Available</span>
                <MinusCircle className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </div>
        );
      },
    },
  ];
};
