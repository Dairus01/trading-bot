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
import { useBuyTokenMutation } from "@/services/transactionApi";
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

const QuickBuyForm = () => {
  const [
    quickBuyMutation,
    { isLoading: quickBuyMutationIsLoading, error: quickBuyMutationError },
  ] = useBuyTokenMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokenAddress: "",
      amount: "",
    },
  });

  const quickBuy = useCallback(
    async (payload) => {
      try {
        const response = await quickBuyMutation(payload).unwrap();
        console.log("response-->", response);
        if (!response || response.success === false || !response.data) {
          throw new Error(response?.message || "Buy failed. Please try again.");
        }
        toast.success(response?.message || "Buy successful");
        form.reset();
      } catch (error) {
        console.error("error-->", error);
        toast.error(error?.message || error?.data?.message || "Buy failed. Please try again.");
      }
    },
    [quickBuyMutation]
  );

  const onSubmit = (data) => {
    console.log("Submitted data:", data);
    // Add your submission logic here

    const payload = {
      tokenAddress: data.tokenAddress,
      amountOfSol: data.amount,
    };

    quickBuy(payload);
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
                  placeholder="Enter SOL amount..."
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
          className="text-purple-600 cursor-pointer"
          disabled={quickBuyMutationIsLoading}
        >
          {quickBuyMutationIsLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
            </span>
          ) : (
            "Confirm Buy"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default QuickBuyForm;
