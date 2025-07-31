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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransactionSettingsMutation } from "@/services/transactionApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Define your Zod schema to accept the select keys
const formSchema = z.object({
  gasPriorityFee: z.enum(["low", "medium", "high"]),
  slippageLimit: z.enum(["1", "3", "5"]),
});

const TransactionSettingsForm = () => {
  const [
    transactionSettingsMutation,
    { isLoading: transactionSettingsIsLoading },
  ] = useTransactionSettingsMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      gasPriorityFee: "",
      slippageLimit: "",
    },
  });

  const transactionSettings = useCallback(
    async (payload) => {
      try {
        const response = await transactionSettingsMutation(payload).unwrap();
        console.log("response-->", response);
        toast.success(
          response?.message || "Transaction settings successfully saved."
        );
        form.reset();
      } catch (error) {
        console.error("error-->", error);
        toast.error(
          error?.data?.message || "Failed to save transaction settings."
        );
      }
    },
    [transactionSettingsMutation]
  );

  const onSubmit = (data) => {
    console.log("Submitted data:", data);

    const feeMap = {
      low: 0.00001,
      medium: 0.0001,
      high: 0.001,
    };

    const payload = {
      gasPriorityFee: feeMap[data.gasPriorityFee],
      slippage: Number(data.slippageLimit),
    };

    // Add your submission logic here
    transactionSettings(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Gas Priority Fee Selector */}

        <FormField
          control={form.control}
          name="gasPriorityFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-600">
                Gas Priority Fee
              </FormLabel>
              <Select
                {...field}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gas Priority Fee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="text-purple-600">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* — Slippage Limit Selector — */}
        <FormField
          control={form.control}
          name="slippageLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-purple-600">
                Slippage Limit (%)
              </FormLabel>
              <FormControl>
                <Select
                  {...field}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Slippage" />
                  </SelectTrigger>
                  <SelectContent className="text-purple-600">
                    <SelectItem value="1">1%</SelectItem>
                    <SelectItem value="3">3%</SelectItem>
                    <SelectItem value="5">5%</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={transactionSettingsIsLoading}
          className="text-purple-600 cursor-pointer"
        >
          {transactionSettingsIsLoading ? (
            <span className="flex items-center gap-1">
              <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
            </span>
          ) : (
            "Confirm Transaction Settings"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default TransactionSettingsForm;
