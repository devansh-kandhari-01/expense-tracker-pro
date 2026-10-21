import Budget from "../models/budget_model.js";


// CREATE BUDGET
const createBudget = async (req, res) => {
    try {
        const { category, amount, month } = req.body;

        if (!category || !amount || !month) {
            return res.status(400).json({
                message: "Category, amount and month are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Budget amount must be greater than 0",
            });
        }

        // Prevent duplicate budget for same category and month
        const existingBudget = await Budget.findOne({
            user: req.userId,
            category,
            month,
        });

        if (existingBudget) {
            return res.status(400).json({
                message: "Budget already exists for this category and month",
            });
        }

        const budget = await Budget.create({
            user: req.userId,
            category,
            amount,
            month,
        });

        res.status(201).json({
            message: "Budget created successfully",
            budget,
        });
    } catch (error) {
        console.error("Create budget error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// GET ALL BUDGETS
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({
            user: req.userId,
        }).sort({ month: -1 });

        res.status(200).json({
            budgets,
        });
    } catch (error) {
        console.error("Get budgets error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// UPDATE BUDGET
const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            user: req.userId,
        });

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found",
            });
        }

        const { category, amount, month } = req.body;

        if (amount !== undefined && Number(amount) <= 0) {
            return res.status(400).json({
                message: "Budget amount must be greater than 0",
            });
        }

        if (category !== undefined) {
            budget.category = category;
        }

        if (amount !== undefined) {
            budget.amount = amount;
        }

        if (month !== undefined) {
            budget.month = month;
        }

        await budget.save();

        res.status(200).json({
            message: "Budget updated successfully",
            budget,
        });
    } catch (error) {
        console.error("Update budget error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// DELETE BUDGET
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({
            _id: req.params.id,
            user: req.userId,
        });

        if (!budget) {
            return res.status(404).json({
                message: "Budget not found",
            });
        }

        await budget.deleteOne();

        res.status(200).json({
            message: "Budget deleted successfully",
        });
    } catch (error) {
        console.error("Delete budget error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


export {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
};