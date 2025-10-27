import { configureStore } from "@reduxjs/toolkit";
import transactionReducer from "./reducers/todoSlice";

export const store = configureStore({
    reducer: {
        trxns: transactionReducer,
    }
});