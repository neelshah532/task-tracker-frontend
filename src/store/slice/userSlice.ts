// src/store/userSlice.js
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  id: string;
  name: string;
  email: string;
  token: string;
  isVerified: boolean;
}

const localState = localStorage.getItem("user") || "";
const userData = localState && JSON.parse(localState || "");

const initialState: UserState = {
  id: userData?.id || "",
  name: userData?.name || "",
  email: userData?.email || "",
  token: userData?.token || "",
  isVerified: userData?.isVerified || false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.token = action.payload.token;
      state.isVerified = action.payload.isVerified;
    },
    clearUser: (state) => {
      state.id = "";
      state.name = "";
      state.email = "";
      state.token = "";
      state.isVerified = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
