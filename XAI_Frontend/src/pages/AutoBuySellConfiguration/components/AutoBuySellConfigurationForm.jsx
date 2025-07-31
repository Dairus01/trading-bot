import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./schema";
import {
  useAutoBuySellConfigurationMutation,
  useGetAutoBuySellConfigurationQuery,
} from "@/services/configurationApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { useGetWalletInfoQuery } from "@/services/generalApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const AutoBuySellConfigurationForm = () => {
  const {
    data: getAutoBuySellConfigurationData,
    isLoading: getAutoBuySellConfigurationIsLoading,
  } = useGetAutoBuySellConfigurationQuery();

  const { data: getWalletInfoData, isLoading: getWalletInfoIsLoading } =
    useGetWalletInfoQuery();

  const totalSol = getWalletInfoData?.data?.balance;
  const max_slider_value = totalSol > 0.005 ? totalSol - 0.005 : 0.005; // Ensure a valid max value, at least min for slider

  console.log(
    "getWalletInfoData?.data?.balance-->",
    getWalletInfoData?.data?.balance
  );

  const [
    autoBuySellConfigurationMutation,
    {
      isLoading: autoBuySellConfigurationIsLoading,
      error: autoBuySellConfigurationError,
    },
  ] = useAutoBuySellConfigurationMutation();

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      minimumLiquidity: "",
      lpBurn: false,
      ownershipRenounced: false,
      autoBuyAmountOfSol: "",
      takeProfitPercentageProfit: "",
      reEntryPercentage: "",
      reEntrySolAmount: undefined,
      stopLossLogic: "TSL_MSL_COMBINED",
      trailingStopLossEnabled: false,
      trailingStopLossPercentage: "10",
      maxStopLossEnabled: false,
      maxStopLossPercentage: "20",
      reEntryEnabled: false,
      reEntryOffsetPercentage: "5",
      maxReEntries: 3,
    },
  });

  const modifiedAutoBuySellConfigurationData =
    getAutoBuySellConfigurationData?.data;

  useEffect(() => {
    if (!modifiedAutoBuySellConfigurationData) return;

    form.reset({
      minimumLiquidity: String(
        modifiedAutoBuySellConfigurationData.minimunLp ?? ""
      ),
      lpBurn: modifiedAutoBuySellConfigurationData.checkLpBurn ?? false,
      ownershipRenounced:
        modifiedAutoBuySellConfigurationData.OwnershipRenouncedCheck ?? false,
      autoBuyAmountOfSol: String(
        modifiedAutoBuySellConfigurationData.autoBuyAmountOfSol ?? ""
      ),
      takeProfitPercentageProfit: String(
        modifiedAutoBuySellConfigurationData.take_profit?.[0]
          ?.percentageProfit ?? ""
      ),
      reEntryPercentage: String(
        modifiedAutoBuySellConfigurationData.reEntry?.percentage ?? ""
      ),
      reEntrySolAmount:
        modifiedAutoBuySellConfigurationData.reEntry?.solAmount ?? undefined,
      stopLossLogic: modifiedAutoBuySellConfigurationData.advancedStopLoss?.stopLossLogic ?? "TSL_MSL_COMBINED",
      trailingStopLossEnabled: modifiedAutoBuySellConfigurationData.advancedStopLoss?.trailingStopLoss?.enabled ?? false,
      trailingStopLossPercentage: String(modifiedAutoBuySellConfigurationData.advancedStopLoss?.trailingStopLoss?.percentage ?? "10"),
      maxStopLossEnabled: modifiedAutoBuySellConfigurationData.advancedStopLoss?.maxStopLoss?.enabled ?? false,
      maxStopLossPercentage: String(modifiedAutoBuySellConfigurationData.advancedStopLoss?.maxStopLoss?.percentage ?? "20"),
      reEntryEnabled: modifiedAutoBuySellConfigurationData.advancedStopLoss?.reEntrySettings?.enabled ?? false,
      reEntryOffsetPercentage: String(modifiedAutoBuySellConfigurationData.advancedStopLoss?.reEntrySettings?.offsetPercentage ?? "5"),
      maxReEntries: modifiedAutoBuySellConfigurationData.advancedStopLoss?.reEntrySettings?.maxReEntries ?? 3,
    });
  }, [modifiedAutoBuySellConfigurationData, form]);

  const autoBuySellConfiguration = useCallback(
    async (payload) => {
      try {
        const response = await autoBuySellConfigurationMutation(
          payload
        ).unwrap();
        console.log("response-->", response);
        toast.success(response?.message);
        form.reset();
      } catch (error) {
        console.error("error-->", error);
        toast.error(error?.data?.message || "error");
      }
    },
    [autoBuySellConfigurationMutation, form]
  );

  const onSubmit = (data) => {
    console.log("Submitted data:", data);

    const payload = {
      checkLpBurn: data.lpBurn,
      OwnershipRenouncedCheck: data.ownershipRenounced,
      minimunLp: data.minimumLiquidity,
      autoBuyAmountOfSol: data.autoBuyAmountOfSol,
      autoBuyEnable: false,
      autoSellenable: true,
      stop_loss: [
        {
          percentageLoss: data.maxStopLossEnabled ? data.maxStopLossPercentage : 20,
          sellPercentage: 100,
        },
      ],
      ...(data?.takeProfitPercentageProfit && {
        take_profit: [
          {
            percentageProfit: data.takeProfitPercentageProfit,
            sellPercentage: 100,
          },
        ],
      }),
      reEntry: {
        percentage: data.reEntryPercentage,
        solAmount: data.reEntrySolAmount,
      },
      advancedStopLoss: {
        trailingStopLoss: {
          enabled: data.trailingStopLossEnabled,
          percentage: parseFloat(data.trailingStopLossPercentage),
        },
        maxStopLoss: {
          enabled: data.maxStopLossEnabled,
          percentage: parseFloat(data.maxStopLossPercentage),
        },
        stopLossLogic: data.stopLossLogic,
        reEntrySettings: {
          enabled: data.reEntryEnabled,
          offsetPercentage: parseFloat(data.reEntryOffsetPercentage),
          maxReEntries: data.maxReEntries,
        },
      },
    };

    console.log("payload data -->", payload);

    autoBuySellConfiguration(payload);
  };

  return (
    <>
      {getAutoBuySellConfigurationIsLoading ||
        (getWalletInfoIsLoading && <LoadingScreen />)}
      <Form {...form} key={totalSol}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* General Settings */}
          <FormField
            control={form.control}
            name="minimumLiquidity"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-purple-600">
                  Minimum Liquidity
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter minimum liquidity..."
                    type="number"
                    step="any"
                    className="text-purple-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex justify-center">
            <div className="w-full flex flex-col items-start lg:flex-row lg:justify-center gap-y-4 gap-x-6">
              <FormField
                control={form.control}
                name="lpBurn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-purple-950 data-[state=checked]:border-purple-800 border-purple-600/30"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 text-purple-600">
                      LP Burn
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownershipRenounced"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-purple-950 data-[state=checked]:border-purple-800 border-purple-600/30"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 text-purple-600">
                      Ownership Renounced
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="autoBuyAmountOfSol"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-purple-600">
                  Amount of SOL for Auto Buy
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter SOL amount..."
                    type="number"
                    step="any"
                    className="text-purple-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Removed duplicate Trailing Stop Loss field - now handled in Advanced Stop Loss section */}

          {/* Take Profit Settings */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-start justify-between">
              <FormField
                control={form.control}
                name="takeProfitPercentageProfit"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-purple-600">
                      Take Profit Percentage (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter percentage profit..."
                        type="number"
                        step="any"
                        className="text-purple-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Re-Entry Settings */}
          <div className="flex flex-col gap-4">
            <h4 className="text-purple-700 text-base font-semibold text-center">
              Re-Entry Settings
            </h4>
            <div className="flex flex-col lg:flex-row gap-12 lg:items-start justify-between">
              <FormField
                control={form.control}
                name="reEntryPercentage"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-purple-600">
                      Re-Entry Percentage (%)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter re-entry percentage..."
                        type="number"
                        step="any"
                        className="text-purple-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reEntrySolAmount"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel className="text-purple-600">
                      Re-Entry SOL Amount
                    </FormLabel>
                    <div>
                      <FormControl>
                        <Slider
                          value={[field.value || 0]}
                          min={0.0005}
                          max={max_slider_value}
                          step={0.0001}
                          onValueChange={(value) => field.onChange(value[0])}
                          className={cn("w-full", "py-4")}
                        />
                      </FormControl>
                      <span className="text-base text-gray-500">
                        {field.value}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Advanced Stop Loss Logic Selection */}
          <FormField
            control={form.control}
            name="stopLossLogic"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel className="text-purple-600">Stop Loss Logic</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select stop loss logic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TSL_ONLY">Trailing Stop Loss Only</SelectItem>
                    <SelectItem value="MSL_ONLY">Max Stop Loss Only</SelectItem>
                    <SelectItem value="TSL_MSL_COMBINED">TSL + MSL Combined</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          {/* Trailing Stop Loss */}
          <div className="flex flex-row items-center gap-4 mt-2">
            <FormField
              control={form.control}
              name="trailingStopLossEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormLabel className="mb-0 text-purple-600">Enable TSL</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="trailingStopLossPercentage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormLabel className="mb-0 text-purple-600">TSL %</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="any" className="text-purple-600 w-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Max Stop Loss */}
          <div className="flex flex-row items-center gap-4 mt-2">
            <FormField
              control={form.control}
              name="maxStopLossEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormLabel className="mb-0 text-purple-600">Enable MSL</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxStopLossPercentage"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2">
                  <FormLabel className="mb-0 text-purple-600">MSL %</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="any" className="text-purple-600 w-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* Re-Entry Settings */}
          <div className="flex flex-col gap-4 mt-4">
            <h4 className="text-purple-700 text-base font-semibold text-center">Advanced Re-Entry Settings</h4>
            <div className="flex flex-row gap-4 items-center">
              <FormField
                control={form.control}
                name="reEntryEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel className="mb-0 text-purple-600">Enable Re-Entry</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reEntryOffsetPercentage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel className="mb-0 text-purple-600">Offset %</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="any" className="text-purple-600 w-20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxReEntries"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormLabel className="mb-0 text-purple-600">Max Re-Entries</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        step="1" 
                        min="1"
                        max="10"
                        className="text-purple-600 w-20" 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        value={field.value || 3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="text-purple-600 cursor-pointer"
            disabled={autoBuySellConfigurationIsLoading}
          >
            {autoBuySellConfigurationIsLoading ||
            autoBuySellConfigurationIsLoading ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-5 w-5 animate-spin" /> Confirming...
              </span>
            ) : (
              "Confirm Auto Buy & Sell Settings"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default AutoBuySellConfigurationForm;
