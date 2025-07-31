import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// main file which create the api
export const Apis = createApi({
  reducerPath: "apis",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL || "http://localhost:8100",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");

      headers.set("ngrok-skip-browser-warning", true);
      
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
  tagTypes: ["Transaction", "Snipping"],
});
