import React, { useCallback, useEffect, useMemo } from "react";
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
import { useWithdrawSolAmountMutation } from "@/services/transactionApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Function to create validation schema dynamically based on totalSol
const createValidationSchema = (totalSol) => {
  const safeTotalSol = totalSol ?? 0; // Ensure totalSol is a valid number

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
          return num <= safeTotalSol;
        },
        {
          message: `Amount cannot exceed available balance (${safeTotalSol} SOL)`,
        }
      ),
  });
};

const WithdrawDialogContent = ({ close, totalSol }) => {
  // API Related, Mutation
  const [withdrawSolAmountMutation, { isLoading: withdrawSolAmountIsLoading }] =
    useWithdrawSolAmountMutation();

  // Memoize the schema so it updates when totalSol changes
  const validationSchema = useMemo(
    () => createValidationSchema(totalSol),
    [totalSol]
  );

  const form = useForm({
    resolver: zodResolver(validationSchema),
    mode: "onChange", // Ensures validation updates dynamically
    defaultValues: {
      amount: "",
    },
  });

  const withdrawSolAmount = useCallback(
    async (payload) => {
      try {
        const response = await withdrawSolAmountMutation(payload).unwrap();
        console.log("response-->", response);
        toast.success(response?.message);
        close();
      } catch (error) {
        console.error("error-->", error);
        toast.error(error?.data?.message || "error");
      }
    },
    [withdrawSolAmountMutation, close]
  );

  const onSubmit = (data) => {
    console.log("Submitted data:", data);
    // Add your withdrawal submission logic here

    const payload = {
      amountOfSol: data.amount,
    };

    withdrawSolAmount(payload);
  };

  return (
    <Form {...form} key={totalSol}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className="mt-4">
              <FormLabel className="text-white">SOL Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={`Enter SOL amount (Max: ${totalSol} SOL)`}
                  className="text-white"
                  disabled={withdrawSolAmountIsLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={withdrawSolAmountIsLoading}
          className="text-purple-500 cursor-pointer"
        >
          {withdrawSolAmountIsLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
            </span>
          ) : (
            "Confirm Withdrawal"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default WithdrawDialogContent;
