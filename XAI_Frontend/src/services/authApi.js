import { Apis } from "./api";

export const authApi = Apis.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body: body,
      }),
      invalidatesTags: [],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
