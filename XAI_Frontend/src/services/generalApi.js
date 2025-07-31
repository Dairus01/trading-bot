import { Apis } from "./api";

export const generalApi = Apis.injectEndpoints({
  endpoints: (builder) => ({
    getWalletInfo: builder.query({
      query: (params) => ({
        url: "admin/fundWalletBalance",
        method: "GET",
        params,
      }),
      providesTags: ["Transaction"],
    }),
  }),

  overrideExisting: false,
});

export const { useGetWalletInfoQuery } = generalApi;
