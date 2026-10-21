import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["income", "expense"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        date: {
            type: Date,
            required: true,
        },

        paymentMethod: {
            type: String,
            required: true,
            trim: true,
        },

        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model(
    "Transaction",
    transactionSchema
);

export default Transaction;