import { createSlice } from "@reduxjs/toolkit";

// Function to safely parse JSON
const parseJSON = (item) => {
  try {
    return JSON.parse(item);
  } catch (error) {
    return null; // Return null if parsing fails
  }
};

// Parse the data with JSON.parse(), and the data becomes a JavaScript object.
const userDetailsParsed = parseJSON(localStorage.getItem("userDetails"));
const tokenInLocal = localStorage.getItem("token");

// Define the initial state
const initialStates = {
  userDetails: userDetailsParsed || null,
  token: tokenInLocal || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialStates,
  reducers: {
    // Actions
    setUser: (state, action) => {
      state.userDetails = action.payload;
      localStorage.setItem("userDetails", JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.userDetails = null;
      localStorage.removeItem("userDetails");
    },
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, clearUser, setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
