import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./configuration/mongodb_config.js";
import authRoutes from "./routes/auth_routes.js";
import transactionRoutes from "./routes/transaction_routes.js";
import budgetRoutes from "./routes/budget_routes.js";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker API is running",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});