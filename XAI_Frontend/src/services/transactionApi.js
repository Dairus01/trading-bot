import { Apis } from "./api";

export const transactionApi = Apis.injectEndpoints({
  endpoints: (builder) => ({
    buyToken: builder.mutation({
      query: (body) => ({
        url: "admin/directBuy",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    sellToken: builder.mutation({
      query: (body) => ({
        url: "admin/directSell",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    withdrawSolAmount: builder.mutation({
      query: (body) => ({
        url: "admin/withdraw",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    transactionSettings: builder.mutation({
      query: (body) => ({
        url: "admin/transactionSettings",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    getTokenHoldings: builder.query({
      query: (params) => ({
        url: "admin/getTokenHolding",
        method: "GET",
        params,
      }),
      providesTags: ["Transaction"],
    }),
    getTransactionHistory: builder.query({
      query: (params) => ({
        url: "admin/transactionHistory",
        method: "GET",
        params,
      }),
      providesTags: ["Transaction"],
    }),
    getScrappedToken: builder.query({
      query: (params) => ({
        url: "admin/getScrappedToken",
        method: "GET",
        params,
      }),
      // providesTags: ["Transaction"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useBuyTokenMutation,
  useSellTokenMutation,
  useTransactionSettingsMutation,
  useWithdrawSolAmountMutation,
  useGetTransactionHistoryQuery,
  useGetTokenHoldingsQuery,
  useGetScrappedTokenQuery,
} = transactionApi;
