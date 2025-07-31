import { Apis } from "./api";

export const configurationApi = Apis.injectEndpoints({
  endpoints: (builder) => ({
    getAutoBuySellConfiguration: builder.query({
      query: (params) => ({
        url: "admin/getSetCriteria",
        method: "GET",
        params,
      }),
      providesTags: ["Transaction", "Snipping"],
    }),
    autoBuySellConfiguration: builder.mutation({
      query: (body) => ({
        url: "admin/advanceBuy",
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    // stopAndStartAutoBuy
    enableSnipping: builder.mutation({
      query: (body) => ({
        url: "admin/stopAndStartAutoBuy",
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["Snipping"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAutoBuySellConfigurationQuery,
  useAutoBuySellConfigurationMutation,
  useEnableSnippingMutation,
} = configurationApi;
