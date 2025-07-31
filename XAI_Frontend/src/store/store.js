import { configureStore, isRejectedWithValue } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { Apis } from "@/services/api";

const rtkQueryErrorLogger = (api) => (next) => async (action) => {
  try {
    if (isRejectedWithValue(action)) {
      if (
        action.payload?.data?.msg === "Missing Authorization Header" ||
        action.payload?.data?.message === "Invalid Token" ||
        action.payload?.data?.message === "Please provide token"
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("userDetails");
      }
    }
  } catch (err) {
    /* empty */
  }

  return next(action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(Apis.middleware).concat(rtkQueryErrorLogger),
});
