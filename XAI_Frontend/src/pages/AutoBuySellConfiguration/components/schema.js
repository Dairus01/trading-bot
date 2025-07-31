import { z } from "zod";

export const formSchema = z.object({
  minimumLiquidity: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num >= 1, {
      message: "Minimum liquidity must be greater than 0",
    }),
  lpBurn: z.boolean().default(false),
  ownershipRenounced: z.boolean().default(false),
  autoBuyAmountOfSol: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num > 0, {
      message: "Amount of SOL must be greater than 0",
    }),
  // Removed stopLossPercentageLoss - now handled by advanced stop loss settings
  takeProfitPercentageProfit: z
    .string()
    .optional()
    .transform((val) => {
      // If the user didn’t submit anything, bail out with `undefined`
      if (val === undefined || val.trim() === "") return undefined;
      return parseFloat(val);
    })
    .refine(
      (num) => num === undefined || (!isNaN(num) && num > 0 && num <= 100),
      { message: "Take profit percentage must be between 0 and 100" }
    ),
  reEntryPercentage: z
    .string()
    .transform((val) => parseFloat(val))
    .refine((num) => !isNaN(num) && num > 0 && num <= 100, {
      message: "Re-entry percentage must be between 0 and 100",
    }),
  // reEntrySolAmount: z
  //   .string()
  //   .transform((val) => parseFloat(val))
  //   .refine((num) => !isNaN(num) && num > 0, {
  //     message: "Re-entry SOL amount must be greater than 0",
  //   }),
  reEntrySolAmount: z
    .number({ required_error: "Re-entry SOL amount is required" })
    .refine((num) => num > 0, {
      message: "Re-entry SOL amount must be greater than 0",
    }),
  stopLossLogic: z.enum(["TSL_ONLY", "MSL_ONLY", "TSL_MSL_COMBINED"]).default("TSL_MSL_COMBINED"),
  trailingStopLossEnabled: z.boolean().default(false),
  trailingStopLossPercentage: z.string().transform((val) => parseFloat(val)).refine((num) => !isNaN(num) && num > 0 && num <= 100, { message: "Trailing Stop Loss % must be 0-100" }),
  maxStopLossEnabled: z.boolean().default(false),
  maxStopLossPercentage: z.string().transform((val) => parseFloat(val)).refine((num) => !isNaN(num) && num > 0 && num <= 100, { message: "Max Stop Loss % must be 0-100" }),
  reEntryEnabled: z.boolean().default(false),
  reEntryOffsetPercentage: z.string().transform((val) => parseFloat(val)).refine((num) => !isNaN(num) && num >= 0 && num <= 50, { message: "Re-entry offset % must be 0-50" }),
  maxReEntries: z.coerce.number().min(1).max(10).default(3),
});
