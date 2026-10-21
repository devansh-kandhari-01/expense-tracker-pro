import { useEffect, useMemo, useState } from "react";

import {
    FaWallet,
    FaMoneyBillWave,
    FaPiggyBank,
    FaChartPie,
    FaEdit,
    FaTrash,
    FaPlus,
    FaTimes,
} from "react-icons/fa";

import { getTransactions } from "../services/transactionService";

import {
    getBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
} from "../services/budgetService";


// --------------------------------------------------
// Current month
// --------------------------------------------------

const getCurrentMonth = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
};


// --------------------------------------------------
// Expense categories
// --------------------------------------------------

const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Bills",
    "Health",
    "Education",
    "Travel",
    "Other",
];


// --------------------------------------------------
// Empty form
// --------------------------------------------------

const emptyForm = {
    category: "",
    amount: "",
    month: getCurrentMonth(),
};


// --------------------------------------------------
// Format money
// --------------------------------------------------

const formatMoney = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;


// --------------------------------------------------
// Format month
// --------------------------------------------------

const formatMonth = (month) => {
    if (!month) return "";

    const [year, monthNumber] =
        month.split("-").map(Number);

    return new Date(
        year,
        monthNumber - 1,
        1
    ).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
    });
};


// --------------------------------------------------
// Get transaction date as YYYY-MM
// --------------------------------------------------

const getTransactionMonth = (dateValue) => {
    if (!dateValue) {
        return "";
    }

    const dateString = String(dateValue);

    return dateString.slice(0, 7);
};


// --------------------------------------------------
// Get budget status
// --------------------------------------------------

const getBudgetStatus = (percentage) => {
    if (percentage > 100) {
        return "Exceeded";
    }

    if (percentage >= 90) {
        return "Almost Reached";
    }

    if (percentage >= 70) {
        return "Getting Close";
    }

    return "On Track";
};


// --------------------------------------------------
// Status badge styling
// --------------------------------------------------

const getStatusClass = (status) => {
    switch (status) {
        case "Exceeded":
            return "bg-red-100 text-red-700";

        case "Almost Reached":
            return "bg-orange-100 text-orange-700";

        case "Getting Close":
            return "bg-yellow-100 text-yellow-700";

        default:
            return "bg-green-100 text-green-700";
    }
};


// --------------------------------------------------
// Progress bar styling
// --------------------------------------------------

const getProgressClass = (status) => {
    switch (status) {
        case "Exceeded":
            return "bg-red-500";

        case "Almost Reached":
            return "bg-orange-500";

        case "Getting Close":
            return "bg-yellow-500";

        default:
            return "bg-green-500";
    }
};


// --------------------------------------------------
// Main component
// --------------------------------------------------

function Budgets() {

    // ----------------------------------------------
    // Backend data
    // ----------------------------------------------

    const [budgets, setBudgets] = useState([]);

    const [transactions, setTransactions] =
        useState([]);


    // ----------------------------------------------
    // Loading / error
    // ----------------------------------------------

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ----------------------------------------------
    // Filter states
    // ----------------------------------------------

    const [selectedMonth, setSelectedMonth] =
        useState(getCurrentMonth());

    const [categoryFilter, setCategoryFilter] =
        useState("");


    // ----------------------------------------------
    // Modal states
    // ----------------------------------------------

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [formData, setFormData] = useState({
        ...emptyForm,
        month: getCurrentMonth(),
    });


    // ----------------------------------------------
    // Submit/loading states
    // ----------------------------------------------

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    // ------------------------------------------------
    // Fetch budgets and transactions
    // ------------------------------------------------

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                budgetResponse,
                transactionResponse,
            ] = await Promise.all([
                getBudgets(),
                getTransactions(),
            ]);

            setBudgets(
                budgetResponse.budgets || []
            );

            setTransactions(
                transactionResponse.transactions || []
            );

        } catch (error) {

            console.error(
                "Fetch budget data error:",
                error.message
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };


    // ------------------------------------------------
    // Fetch data on page load
    // ------------------------------------------------

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchData();
    }, []);


    // ------------------------------------------------
    // Filter budgets
    // ------------------------------------------------

    const filteredBudgets = useMemo(() => {
        return budgets.filter((budget) => {

            const matchesMonth =
                budget.month === selectedMonth;

            const matchesCategory =
                categoryFilter === "" ||
                budget.category === categoryFilter;

            return (
                matchesMonth &&
                matchesCategory
            );
        });
    }, [
        budgets,
        selectedMonth,
        categoryFilter,
    ]);


    // ------------------------------------------------
    // Calculate spent amount
    // ------------------------------------------------

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const getSpentAmount = (
        category,
        month
    ) => {

        return transactions.reduce(
            (total, transaction) => {

                const transactionMonth =
                    getTransactionMonth(
                        transaction.date
                    );

                if (
                    transaction.type === "expense" &&
                    transaction.category === category &&
                    transactionMonth === month
                ) {
                    return (
                        total +
                        Number(transaction.amount)
                    );
                }

                return total;
            },
            0
        );
    };


    // ------------------------------------------------
    // Calculate budget rows
    // ------------------------------------------------

    const budgetRows = useMemo(() => {

        return filteredBudgets.map(
            (budget) => {

                const spent =
                    getSpentAmount(
                        budget.category,
                        budget.month
                    );

                const budgetAmount =
                    Number(budget.amount);

                const remaining =
                    budgetAmount - spent;

                const percentage =
                    budgetAmount > 0
                        ? (spent / budgetAmount) *
                          100
                        : 0;

                const status =
                    getBudgetStatus(
                        percentage
                    );

                return {
                    ...budget,
                    spent,
                    remaining,
                    percentage,
                    status,
                };
            }
        );

    }, [filteredBudgets, getSpentAmount]);


    // ------------------------------------------------
    // Summary calculations
    // ------------------------------------------------

    const totalBudget =
        budgetRows.reduce(
            (total, budget) =>
                total +
                Number(budget.amount),
            0
        );


    const totalSpent =
        budgetRows.reduce(
            (total, budget) =>
                total +
                Number(budget.spent),
            0
        );


    const totalRemaining =
        totalBudget - totalSpent;


    const budgetUsage =
        totalBudget > 0
            ? (totalSpent / totalBudget) * 100
            : 0;


    // ------------------------------------------------
    // Open Add modal
    // ------------------------------------------------

    const openAddModal = () => {

        setEditingId(null);

        setFormData({
            ...emptyForm,
            month: selectedMonth,
        });

        setIsModalOpen(true);
    };


    // ------------------------------------------------
    // Open Edit modal
    // ------------------------------------------------

    const openEditModal = (budget) => {

        setEditingId(budget._id);

        setFormData({
            category: budget.category,
            amount: String(
                budget.amount
            ),
            month: budget.month,
        });

        setIsModalOpen(true);
    };


    // ------------------------------------------------
    // Close modal
    // ------------------------------------------------

    const closeModal = () => {

        if (isSubmitting) {
            return;
        }

        setIsModalOpen(false);

        setEditingId(null);

        setFormData({
            ...emptyForm,
            month: selectedMonth,
        });
    };


    // ------------------------------------------------
    // Handle form changes
    // ------------------------------------------------

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };


    // ------------------------------------------------
    // Submit budget
    // ------------------------------------------------

    const handleSubmit = async (event) => {

        event.preventDefault();

        const amount =
            Number(formData.amount);


        // Validate amount

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            window.alert(
                "Please enter a valid budget amount."
            );

            return;
        }


        // Validate category

        if (!formData.category) {
            window.alert(
                "Please select a category."
            );

            return;
        }


        // Validate month

        if (!formData.month) {
            window.alert(
                "Please select a month."
            );

            return;
        }


        // Prevent duplicate budget

        const duplicateBudget =
            budgets.some(
                (budget) =>
                    budget._id !== editingId &&
                    budget.category ===
                        formData.category &&
                    budget.month ===
                        formData.month
            );


        if (duplicateBudget) {

            window.alert(
                "A budget already exists for this category and month. Please edit the existing budget instead."
            );

            return;
        }


        try {

            setIsSubmitting(true);

            setError("");


            const budgetData = {
                category:
                    formData.category,

                amount,

                month:
                    formData.month,
            };


            // ----------------------------------------
            // Update
            // ----------------------------------------

            if (editingId) {

                const response =
                    await updateBudget(
                        editingId,
                        budgetData
                    );


                setBudgets((current) =>
                    current.map(
                        (budget) =>
                            budget._id ===
                            editingId
                                ? response.budget
                                : budget
                    )
                );

            }


            // ----------------------------------------
            // Create
            // ----------------------------------------

            else {

                const response =
                    await createBudget(
                        budgetData
                    );


                setBudgets((current) => [
                    ...current,
                    response.budget,
                ]);
            }


            // Show saved month

            setSelectedMonth(
                formData.month
            );

            setCategoryFilter("");

            setIsModalOpen(false);

            setEditingId(null);

            setFormData({
                ...emptyForm,
                month: formData.month,
            });

        } catch (error) {

            console.error(
                "Save budget error:",
                error.message
            );

            window.alert(
                error.message
            );

        } finally {

            setIsSubmitting(false);
        }
    };


    // ------------------------------------------------
    // Delete budget
    // ------------------------------------------------

    const handleDelete = async (id) => {

        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this budget?"
            );


        if (!shouldDelete) {
            return;
        }


        try {

            setDeletingId(id);

            setError("");


            await deleteBudget(id);


            setBudgets((current) =>
                current.filter(
                    (budget) =>
                        budget._id !== id
                )
            );

        } catch (error) {

            console.error(
                "Delete budget error:",
                error.message
            );

            window.alert(
                error.message
            );

        } finally {

            setDeletingId(null);
        }
    };


    // ------------------------------------------------
    // Loading screen
    // ------------------------------------------------

    if (loading) {

        return (
            <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                        <p className="mt-4 text-text-secondary">
                            Loading budgets...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ------------------------------------------------
    // Main UI
    // ------------------------------------------------

    return (
        <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">

            {/* -------------------------------------- */}
            {/* Header */}
            {/* -------------------------------------- */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                        Budgets
                    </h1>

                    <p className="mt-2 text-text-secondary">
                        Plan your spending and track your limits.
                    </p>

                </div>


                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                    <FaPlus />

                    Add Budget
                </button>

            </div>


            {/* -------------------------------------- */}
            {/* Error */}
            {/* -------------------------------------- */}

            {error && (

                <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">

                    <p className="text-sm">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={fetchData}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 cursor-pointer"
                    >
                        Retry
                    </button>

                </div>
            )}


            {/* -------------------------------------- */}
            {/* Filters */}
            {/* -------------------------------------- */}

            <div className="mb-7 flex flex-col gap-3 sm:flex-row">

                <div>

                    <label
                        htmlFor="budget-month"
                        className="mb-2 block text-sm font-medium text-text-secondary"
                    >
                        Select Month
                    </label>


                    <input
                        id="budget-month"
                        type="month"
                        value={selectedMonth}
                        onChange={(event) =>
                            setSelectedMonth(
                                event.target.value
                            )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 sm:w-56"
                    />

                </div>


                <div>

                    <label
                        htmlFor="budget-category-filter"
                        className="mb-2 block text-sm font-medium text-text-secondary"
                    >
                        Category
                    </label>


                    <select
                        id="budget-category-filter"
                        value={categoryFilter}
                        onChange={(event) =>
                            setCategoryFilter(
                                event.target.value
                            )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 sm:w-56"
                    >

                        <option value="">
                            All Categories
                        </option>


                        {categories.map(
                            (category) => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* -------------------------------------- */}
            {/* Summary Cards */}
            {/* -------------------------------------- */}

            <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    icon={FaWallet}
                    title="Total Budget"
                    value={formatMoney(
                        totalBudget
                    )}
                    note={formatMonth(
                        selectedMonth
                    )}
                    color="bg-blue-100 text-blue-600"
                />


                <SummaryCard
                    icon={FaMoneyBillWave}
                    title="Total Spent"
                    value={formatMoney(
                        totalSpent
                    )}
                    note="Spending against budgets"
                    color="bg-red-100 text-red-600"
                />


                <SummaryCard
                    icon={FaPiggyBank}
                    title="Remaining"
                    value={formatMoney(
                        totalRemaining
                    )}
                    note={
                        totalRemaining < 0
                            ? "Over budget"
                            : "Available budget"
                    }
                    color="bg-green-100 text-green-600"
                />


                <SummaryCard
                    icon={FaChartPie}
                    title="Budget Usage"
                    value={`${budgetUsage.toFixed(
                        1
                    )}%`}
                    note="Spent vs planned budget"
                    color="bg-purple-100 text-purple-600"
                />

            </div>


            {/* -------------------------------------- */}
            {/* Monthly Budget */}
            {/* -------------------------------------- */}

            <div className="mb-7">

                <div className="mb-5">

                    <h2 className="text-2xl font-bold text-text-primary">
                        Monthly Budget
                    </h2>

                    <p className="mt-1 text-text-secondary">
                        {formatMonth(
                            selectedMonth
                        )}
                    </p>

                </div>


                {budgetRows.length > 0 ? (

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                        {budgetRows.map(
                            (budget) => (

                                <div
                                    key={budget._id}
                                    className="rounded-2xl bg-white p-5 shadow-sm"
                                >

                                    {/* Card Header */}

                                    <div className="mb-4 flex items-start justify-between gap-3">

                                        <div>

                                            <h3 className="text-lg font-bold text-slate-900">
                                                {budget.category}
                                            </h3>

                                            <p className="mt-1 text-sm text-slate-500">
                                                {formatMonth(
                                                    budget.month
                                                )}
                                            </p>

                                        </div>


                                        <span
                                            className={`rounded-lg px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                budget.status
                                            )}`}
                                        >
                                            {budget.status}
                                        </span>

                                    </div>


                                    {/* Amount */}

                                    <div className="mb-3 flex items-center justify-between gap-2">

                                        <p className="text-sm text-slate-600">
                                            {formatMoney(
                                                budget.spent
                                            )}{" "}
                                            spent
                                        </p>


                                        <p className="text-sm font-semibold text-slate-900">
                                            {formatMoney(
                                                budget.amount
                                            )}
                                        </p>

                                    </div>


                                    {/* Progress */}

                                    <div
                                        className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
                                        role="progressbar"
                                        aria-label={`${budget.category} budget usage`}
                                        aria-valuenow={Math.min(
                                            budget.percentage,
                                            100
                                        )}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    >

                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${getProgressClass(
                                                budget.status
                                            )}`}
                                            style={{
                                                width: `${Math.min(
                                                    budget.percentage,
                                                    100
                                                )}%`,
                                            }}
                                        />

                                    </div>


                                    {/* Remaining */}

                                    <div className="mt-3 flex items-center justify-between gap-2">

                                        <p
                                            className={`text-sm font-medium ${
                                                budget.remaining <
                                                0
                                                    ? "text-red-600"
                                                    : "text-slate-500"
                                            }`}
                                        >

                                            {budget.remaining <
                                            0
                                                ? `${formatMoney(
                                                      Math.abs(
                                                          budget.remaining
                                                      )
                                                  )} over budget`
                                                : `${formatMoney(
                                                      budget.remaining
                                                  )} remaining`}

                                        </p>


                                        <p className="text-sm font-semibold text-slate-700">
                                            {budget.percentage.toFixed(
                                                0
                                            )}
                                            %
                                        </p>

                                    </div>


                                    {/* Actions */}

                                    <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openEditModal(
                                                    budget
                                                )
                                            }
                                            title="Edit budget"
                                            aria-label={`Edit ${budget.category} budget`}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                                        >
                                            <FaEdit className="text-lg" />
                                        </button>


                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    budget._id
                                                )
                                            }
                                            disabled={
                                                deletingId ===
                                                budget._id
                                            }
                                            title="Delete budget"
                                            aria-label={`Delete ${budget.category} budget`}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                        >

                                            <FaTrash className="text-lg" />

                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>

                ) : (

                    <div className="rounded-2xl bg-white px-5 py-12 text-center shadow-sm">

                        <FaWallet className="mx-auto mb-4 text-4xl text-slate-300" />

                        <h3 className="text-lg font-semibold text-slate-900">
                            No budgets found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Add a budget for{" "}
                            {formatMonth(
                                selectedMonth
                            )}{" "}
                            or choose a different month.
                        </p>


                        <button
                            type="button"
                            onClick={openAddModal}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                        >
                            <FaPlus />
                            Add Budget
                        </button>

                    </div>
                )}

            </div>


            {/* -------------------------------------- */}
            {/* Budget Table */}
            {/* -------------------------------------- */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="mb-5">

                    <h2 className="text-xl font-bold text-slate-900">
                        Budget Breakdown
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Detailed spending for each budget category.
                    </p>

                </div>


                <div className="overflow-x-auto">

                    <table className="w-full min-w-200">

                        <thead>

                            <tr className="bg-slate-50 text-left">

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Category
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Budget
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Spent
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Remaining
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Usage
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Status
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {budgetRows.map(
                                (budget) => (

                                    <tr
                                        key={budget._id}
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >

                                        <td className="px-4 py-4 font-medium text-slate-800">
                                            {budget.category}
                                        </td>


                                        <td className="px-4 py-4 text-sm text-slate-700">
                                            {formatMoney(
                                                budget.amount
                                            )}
                                        </td>


                                        <td className="px-4 py-4 text-sm font-medium text-red-600">
                                            {formatMoney(
                                                budget.spent
                                            )}
                                        </td>


                                        <td
                                            className={`px-4 py-4 text-sm font-medium ${
                                                budget.remaining <
                                                0
                                                    ? "text-red-600"
                                                    : "text-green-600"
                                            }`}
                                        >
                                            {formatMoney(
                                                budget.remaining
                                            )}
                                        </td>


                                        <td className="px-4 py-4 text-sm font-medium text-slate-700">
                                            {budget.percentage.toFixed(
                                                1
                                            )}
                                            %
                                        </td>


                                        <td className="px-4 py-4">

                                            <span
                                                className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold ${getStatusClass(
                                                    budget.status
                                                )}`}
                                            >
                                                {budget.status}
                                            </span>

                                        </td>


                                        <td className="px-4 py-4">

                                            <div className="flex gap-2">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            budget
                                                        )
                                                    }
                                                    title="Edit budget"
                                                    aria-label={`Edit ${budget.category} budget`}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 cursor-pointer"
                                                >
                                                    <FaEdit className="text-lg" />
                                                </button>


                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            budget._id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        budget._id
                                                    }
                                                    title="Delete budget"
                                                    aria-label={`Delete ${budget.category} budget`}
                                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                >
                                                    <FaTrash className="text-lg" />
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}


                            {budgetRows.length ===
                                0 && (

                                <tr>

                                    <td
                                        colSpan={7}
                                        className="px-4 py-10 text-center text-slate-500"
                                    >
                                        No budgets available for this month.
                                    </td>

                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>


                <p className="mt-5 text-sm text-slate-500">

                    Showing{" "}
                    {budgetRows.length}{" "}
                    budget{" "}
                    {budgetRows.length ===
                    1
                        ? "entry"
                        : "entries"}
                    .

                </p>

            </div>


            {/* -------------------------------------- */}
            {/* Add / Edit Modal */}
            {/* -------------------------------------- */}

            {isModalOpen && (

                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="budget-modal-title"
                        className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
                    >

                        {/* Modal Header */}

                        <div className="mb-6 flex items-center justify-between gap-4">

                            <div>

                                <h2
                                    id="budget-modal-title"
                                    className="text-2xl font-bold text-slate-900"
                                >
                                    {editingId
                                        ? "Edit Budget"
                                        : "Add Budget"}
                                </h2>


                                <p className="mt-1 text-sm text-slate-500">
                                    Set your spending limit for a category.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={isSubmitting}
                                aria-label="Close budget form"
                                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                <FaTimes />
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-5"
                        >

                            {/* Category */}

                            <div>

                                <label
                                    htmlFor="budget-category"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Category
                                </label>


                                <select
                                    id="budget-category"
                                    name="category"
                                    value={
                                        formData.category
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        isSubmitting
                                    }
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                                >

                                    <option value="">
                                        Select category
                                    </option>


                                    {categories.map(
                                        (category) => (

                                            <option
                                                key={
                                                    category
                                                }
                                                value={
                                                    category
                                                }
                                            >
                                                {
                                                    category
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* Amount */}

                            <div>

                                <label
                                    htmlFor="budget-amount"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Budget Amount (₹)
                                </label>


                                <input
                                    id="budget-amount"
                                    name="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        formData.amount
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Enter budget amount"
                                    required
                                    disabled={
                                        isSubmitting
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                                />

                            </div>


                            {/* Month */}

                            <div>

                                <label
                                    htmlFor="budget-form-month"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Month
                                </label>


                                <input
                                    id="budget-form-month"
                                    name="month"
                                    type="month"
                                    value={
                                        formData.month
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    required
                                    disabled={
                                        isSubmitting
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 disabled:bg-slate-100"
                                />

                            </div>


                            {/* Buttons */}

                            <div className="mt-2 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        isSubmitting
                                    }
                                    className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        isSubmitting
                                    }
                                    className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                >
                                    {isSubmitting
                                        ? "Saving..."
                                        : editingId
                                        ? "Save Changes"
                                        : "Add Budget"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}


// --------------------------------------------------
// Summary Card
// --------------------------------------------------

function SummaryCard({
    icon: Icon,
    title,
    value,
    note,
    color,
}) {

    return (

        <div className="rounded-2xl bg-white p-5 shadow-sm">

            <div className="flex items-center gap-4">

                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}
                >
                    <Icon className="text-2xl" />
                </div>


                <div className="min-w-0">

                    <p className="text-sm text-slate-500">
                        {title}
                    </p>


                    <h2 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">
                        {value}
                    </h2>


                    <p className="mt-1 text-xs text-slate-500">
                        {note}
                    </p>

                </div>

            </div>

        </div>
    );
}


export default Budgets;