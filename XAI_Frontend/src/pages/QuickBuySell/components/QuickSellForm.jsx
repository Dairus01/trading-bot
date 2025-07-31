import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSellTokenMutation } from "@/services/transactionApi";
import { Loader2 } from "lucide-react";

// Define validation schema for amount and token address
const formSchema = z.object({
  tokenAddress: z.string().min(1, "Token address is required"),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a valid number greater than 0" }
  ),
});

const QuickSellForm = () => {
  const [
    quickSellMutation,
    { isLoading: quickSellMutationIsLoading, error: quickSellMutationError },
  ] = useSellTokenMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: "",
      amount: "",
    },
  });

  const quickSell = useCallback(
    async (payload) => {
      try {
        const response = await quickSellMutation(payload).unwrap();
        console.log("response-->", response);
        toast.success(response?.message);
        form.reset()
      } catch (error) {
        console.error("error-->", error);
        toast.error(error?.data?.message || "error");
      }
    },
    [quickSellMutation]
  );

  const onSubmit = (data) => {
    console.log("Submitted data:", data);
    // Add your submission logic here

    const payload = {
      tokenAddress: data.tokenAddress,
      amountOfToken: data.amount,
    };

    quickSell(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="tokenAddress"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel className="text-purple-600">Token Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter token address..."
                  className="text-purple-600"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel className="text-purple-600">Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter token amount..."
                  className="text-purple-600"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={quickSellMutationIsLoading}
          className="text-purple-600 cursor-pointer"
        >
          {quickSellMutationIsLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
            </span>
          ) : (
            "Confirm Sell"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default QuickSellForm;
