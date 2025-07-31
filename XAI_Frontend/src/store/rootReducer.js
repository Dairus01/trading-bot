import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { Apis } from "@/services/api";

// Use the combineReducers function to combine the slice reducers into a single root reducer.
const rootReducer = combineReducers({
  [Apis.reducerPath]: Apis.reducer, // Integrates RTK Query's reducer
  auth: authReducer, // This will manage the `auth` state
});

export default rootReducer;
