import Transaction from "../models/transaction_model.js";


// CREATE TRANSACTION
const createTransaction = async (req, res) => {
    try {
        const {
            type,
            amount,
            category,
            description,
            date,
            paymentMethod,
            notes,
        } = req.body;

        if (
            !type ||
            !amount ||
            !category ||
            !date ||
            !paymentMethod
        ) {
            return res.status(400).json({
                message: "Required fields are missing",
            });
        }

        if (!["income", "expense"].includes(type)) {
            return res.status(400).json({
                message: "Transaction type must be income or expense",
            });
        }

        const transaction = await Transaction.create({
            user: req.userId,
            type,
            amount,
            category,
            description,
            date,
            paymentMethod,
            notes,
        });

        res.status(201).json({
            message: "Transaction created successfully",
            transaction,
        });
    } catch (error) {
        console.error("Create transaction error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// GET ALL TRANSACTIONS
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({
            user: req.userId,
        }).sort({ date: -1 });

        res.status(200).json({
            transactions,
        });
    } catch (error) {
        console.error("Get transactions error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// GET SINGLE TRANSACTION
const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.userId,
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found",
            });
        }

        res.status(200).json({
            transaction,
        });
    } catch (error) {
        console.error("Get transaction error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// UPDATE TRANSACTION
const updateTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.userId,
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found",
            });
        }

        const {
            type,
            amount,
            category,
            description,
            date,
            paymentMethod,
            notes,
        } = req.body;

        if (type !== undefined) {
            if (!["income", "expense"].includes(type)) {
                return res.status(400).json({
                    message: "Invalid transaction type",
                });
            }

            transaction.type = type;
        }

        if (amount !== undefined) {
            transaction.amount = amount;
        }

        if (category !== undefined) {
            transaction.category = category;
        }

        if (description !== undefined) {
            transaction.description = description;
        }

        if (date !== undefined) {
            transaction.date = date;
        }

        if (paymentMethod !== undefined) {
            transaction.paymentMethod = paymentMethod;
        }

        if (notes !== undefined) {
            transaction.notes = notes;
        }

        await transaction.save();

        res.status(200).json({
            message: "Transaction updated successfully",
            transaction,
        });
    } catch (error) {
        console.error("Update transaction error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// DELETE TRANSACTION
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.userId,
        });

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found",
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        console.error("Delete transaction error:", error.message);

        res.status(500).json({
            message: "Server error",
        });
    }
};


export {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
};