import express from "express";

import {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget,
} from "../controllers/budget_controller.js";

import authMiddleware from "../middleware/auth_middleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    createBudget
);

router.get(
    "/",
    authMiddleware,
    getBudgets
);

router.put(
    "/:id",
    authMiddleware,
    updateBudget
);

router.delete(
    "/:id",
    authMiddleware,
    deleteBudget
);

export default router;