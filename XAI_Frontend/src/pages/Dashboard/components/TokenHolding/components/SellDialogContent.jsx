import React, { useCallback, useMemo } from "react";
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
import { useSellTokenMutation } from "@/services/transactionApi";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Define validation schema for amount
const createValidationSchema = (balance) => {
  return z.object({
    amount: z
      .string()
      .refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        { message: "Amount must be a valid number greater than 0" }
      )
      .refine(
        (val) => {
          const num = parseFloat(val);
          return num <= balance;
        },
        {
          message: `Amount cannot exceed available balance (${balance})`,
        }
      ),
  });
};

const SellDialogContent = ({ tokenAddress, balance, close }) => {
  const [
    sellMutation,
    { isLoading: sellMutationIsLoading, error: sellMutationError },
  ] = useSellTokenMutation();

  // Memoize the schema so it updates when balance changes
  const validateSchema = useMemo(
    () => createValidationSchema(balance),
    [balance]
  );

  const form = useForm({
    resolver: zodResolver(validateSchema),
    mode: "onChange",
    defaultValues: {
      amount: "",
    },
  });

  const sell = useCallback(
    async (payload) => {
      try {
        const response = await sellMutation(payload).unwrap();
        console.log("response-->", response);
        toast.success(response?.message);
        close();
      } catch (error) {
        console.error("error-->", error);
        toast.error(error?.data?.message || "error");
      }
    },
    [sellMutation, close]
  );

  const onSubmit = (data) => {
    console.log("Submitted data:", data.amount);

    const payload = {
      tokenAddress: tokenAddress,
      amountOfToken: data.amount,
    };

    sell(payload);
  };

  return (
    <Form {...form} key={balance}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel className="text-white">Token Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter Token Amount..."
                  className="text-white"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={sellMutationIsLoading}
          className="text-purple-600 cursor-pointer"
        >
          {sellMutationIsLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
            </span>
          ) : (
            "Confirm sell"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SellDialogContent;
