import { createSlice, nanoid } from "@reduxjs/toolkit";
import {
    FaShoppingCart,
    FaUtensils,
    FaCar,
    FaHeartbeat,
    FaGamepad,
} from "react-icons/fa";
import { MdHome } from "react-icons/md";

export const categories = {
    Food: { name: "Food & Dining", icon: FaUtensils },
    Leisure: { name: "Entertainment", icon: FaGamepad },
    Shopping: { name: "Shopping", icon: FaShoppingCart },
    Transport: { name: "Transport", icon: FaCar },
    Personal: { name: "Healthcare", icon: FaHeartbeat },
    Household: { name: "Household", icon: MdHome },
};

const loadTransactions = () => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
};

const initialState = {
    transactions: loadTransactions().length ? loadTransactions() : [
        { id: 1, transaction_title: "McDonald's", amount: 450, category: "Food & Dining", savingOption: "Round-Up", savingAmount: 50, date: "2025-01-05" },
        { id: 2, transaction_title: "Amazon Shopping", amount: 2500, category: "Shopping", savingOption: "Percentage", savingAmount: 250, date: "2025-01-12" },
        { id: 3, transaction_title: "Fuel Station", amount: 1200, category: "Transport", savingOption: "Fixed Amount", savingAmount: 100, date: "2025-01-20" },
        { id: 4, transaction_title: "Pharmacy", amount: 600, category: "Personal", savingOption: "Percentage", savingAmount: 60, date: "2025-01-28" },
        { id: 5, transaction_title: "Netflix Subscription", amount: 500, category: "Leisure", savingOption: "Round-Up", savingAmount: 100, date: "2025-02-02" },
        { id: 6, transaction_title: "Supermarket", amount: 2000, category: "Shopping", savingOption: "Percentage", savingAmount: 200, date: "2025-02-10" },
        { id: 7, transaction_title: "Gym Membership", amount: 1500, category: "Personal", savingOption: "Fixed Amount", savingAmount: 100, date: "2025-02-15" },
        { id: 8, transaction_title: "Uber Ride", amount: 500, category: "Transport", savingOption: "Round-Up", savingAmount: 100, date: "2025-02-20" },
        { id: 9, transaction_title: "Domino's Pizza", amount: 900, category: "Food & Dining", savingOption: "Percentage", savingAmount: 90, date: "2025-02-25" },
        { id: 10, transaction_title: "Zomato Order", amount: 750, category: "Food & Dining", savingOption: "Fixed Amount", savingAmount: 50, date: "2025-03-01" },
        { id: 11, transaction_title: "Furniture Store", amount: 8000, category: "Household", savingOption: "Percentage", savingAmount: 800, date: "2025-03-03" },
        { id: 12, transaction_title: "Cinema Tickets", amount: 750, category: "Leisure", savingOption: "Round-Up", savingAmount: 50, date: "2025-03-05" },
        { id: 13, transaction_title: "Doctor Visit", amount: 1200, category: "Personal", savingOption: "Percentage", savingAmount: 120, date: "2025-03-07" },
        { id: 14, transaction_title: "Car Service", amount: 2500, category: "Transport", savingOption: "Fixed Amount", savingAmount: 100, date: "2025-03-08" },
        { id: 15, transaction_title: "Spotify Subscription", amount: 500, category: "Leisure", savingOption: "Round-Up", savingAmount: 100, date: "2025-03-09" },
        { id: 16, transaction_title: "Electricity Bill", amount: 1800, category: "Household", savingOption: "Percentage", savingAmount: 180, date: "2025-03-10" },
        { id: 17, transaction_title: "Grocery Shopping", amount: 2200, category: "Shopping", savingOption: "Fixed Amount", savingAmount: 200, date: "2025-03-11" },
        { id: 18, transaction_title: "Restaurant Dinner", amount: 1300, category: "Food & Dining", savingOption: "Percentage", savingAmount: 130, date: "2025-03-11" },
        { id: 19, transaction_title: "Online Course", amount: 3500, category: "Personal", savingOption: "Fixed Amount", savingAmount: 500, date: "2025-03-12" },
        { id: 20, transaction_title: "New Phone Purchase", amount: 40000, category: "Shopping", savingOption: "Percentage", savingAmount: 4000, date: "2025-03-12" },
    ]
};



const saveTransactions = (transactions) => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
};

export const transactionSlice = createSlice({
    name: "transactions",
    initialState,
    reducers: {
        addTransaction: (state, action) => {
            const newTransaction = {
                id: nanoid(),
                transaction_title: action.payload.transaction_title,
                amount: action.payload.amount,
                category: action.payload.category,
                savingOption: action.payload.savingOption || "none",
                savingAmount: action.payload.savingAmount || 0,
                date: new Date().toISOString().split("T")[0],
            };

            state.transactions.push(newTransaction);
            saveTransactions(state.transactions); // Save to localStorage
        },
    },
});

export const { addTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;
