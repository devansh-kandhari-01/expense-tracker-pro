import { useEffect, useMemo, useState } from "react";

import {
    FaWallet,
    FaCalendarAlt,
    FaChartLine,
    FaUsers,
    FaEdit,
    FaTrash,
    FaPlus,
    FaTimes,
} from "react-icons/fa";

import {
    createTransaction,
    getTransactions,
    updateTransaction,
    deleteTransaction,
} from "../services/transactionService";


// ==============================
// CONSTANTS
// ==============================

const categories = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Gift",
    "Other",
];

const paymentMethods = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Other",
];


// ==============================
// HELPERS
// ==============================

const getTodayISO = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const emptyForm = {
    amount: "",
    source: "",
    category: "",
    paymentMethod: "",
    date: getTodayISO(),
};


const formatMoney = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;


const formatDate = (date) => {
    if (!date) return "";

    const dateString = String(date).slice(0, 10);

    const [year, month, day] =
        dateString.split("-").map(Number);

    if (!year || !month || !day) {
        return String(date);
    }

    return new Date(
        year,
        month - 1,
        day
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};


// ==============================
// COMPONENT
// ==============================

function Income() {
    // ==============================
    // DATA STATES
    // ==============================

    const [incomeData, setIncomeData] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ==============================
    // SEARCH / FILTER STATES
    // ==============================

    const [search, setSearch] = useState("");

    const [category, setCategory] = useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("");

    const [dateSort, setDateSort] =
        useState("newest");


    // ==============================
    // MODAL STATES
    // ==============================

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [formData, setFormData] =
        useState(emptyForm);

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    // ==============================
    // FETCH INCOME
    // ==============================

    const fetchIncome = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await getTransactions();

            const transactions =
                data.transactions || [];

            const incomeTransactions =
                transactions
                    .filter(
                        (transaction) =>
                            transaction.type ===
                            "income"
                    )
                    .map((transaction) => ({
                        id: transaction._id,

                        date: String(
                            transaction.date
                        ).slice(0, 10),

                        source:
                            transaction.description ||
                            "Income",

                        category:
                            transaction.category,

                        paymentMethod:
                            transaction.paymentMethod,

                        amount:
                            Number(
                                transaction.amount
                            ),
                    }));

            setIncomeData(
                incomeTransactions
            );
        } catch (error) {
            console.error(
                "Fetch income error:",
                error.message
            );

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchIncome();
    }, []);


    // ==============================
    // FILTER + SORT
    // ==============================

    const filteredIncome = useMemo(() => {
        return [...incomeData]
            .filter((income) => {
                const searchText =
                    search
                        .trim()
                        .toLowerCase();

                const matchesSearch =
                    searchText === "" ||
                    income.source
                        .toLowerCase()
                        .includes(searchText) ||
                    income.category
                        .toLowerCase()
                        .includes(searchText) ||
                    income.paymentMethod
                        .toLowerCase()
                        .includes(searchText);

                const matchesCategory =
                    category === "" ||
                    income.category ===
                        category;

                const matchesPaymentMethod =
                    paymentMethod === "" ||
                    income.paymentMethod ===
                        paymentMethod;

                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesPaymentMethod
                );
            })
            .sort((a, b) => {
                const dateA =
                    new Date(
                        `${a.date}T00:00:00`
                    ).getTime();

                const dateB =
                    new Date(
                        `${b.date}T00:00:00`
                    ).getTime();

                return dateSort === "newest"
                    ? dateB - dateA
                    : dateA - dateB;
            });
    }, [
        incomeData,
        search,
        category,
        paymentMethod,
        dateSort,
    ]);


    // ==============================
    // SUMMARY CALCULATIONS
    // ==============================

    const totalIncome =
        incomeData.reduce(
            (total, income) =>
                total +
                Number(income.amount),
            0
        );


    const currentMonth =
        getTodayISO().slice(0, 7);


    const currentMonthIncome =
        incomeData.reduce(
            (total, income) => {
                return income.date.startsWith(
                    currentMonth
                )
                    ? total +
                          Number(
                              income.amount
                          )
                    : total;
            },
            0
        );


    const monthlyTotals =
        incomeData.reduce(
            (totals, income) => {
                const month =
                    income.date.slice(
                        0,
                        7
                    );

                totals[month] =
                    (totals[month] || 0) +
                    Number(income.amount);

                return totals;
            },
            {}
        );


    const monthValues =
        Object.values(
            monthlyTotals
        );


    const monthlyAverage =
        monthValues.length
            ? monthValues.reduce(
                  (sum, amount) =>
                      sum + amount,
                  0
              ) / monthValues.length
            : 0;


    const sourceCount =
        new Set(
            incomeData.map((income) =>
                income.source
                    .trim()
                    .toLowerCase()
            )
        ).size;


    // ==============================
    // ADD MODAL
    // ==============================

    const openAddModal = () => {
        setEditingId(null);

        setFormData({
            ...emptyForm,
            date: getTodayISO(),
        });

        setError("");

        setIsModalOpen(true);
    };


    // ==============================
    // EDIT MODAL
    // ==============================

    const openEditModal = (income) => {
        setEditingId(income.id);

        setFormData({
            amount: String(
                income.amount
            ),

            source: income.source,

            category:
                income.category,

            paymentMethod:
                income.paymentMethod,

            date: income.date,
        });

        setError("");

        setIsModalOpen(true);
    };


    // ==============================
    // CLOSE MODAL
    // ==============================

    const closeModal = () => {
        if (saving) return;

        setIsModalOpen(false);

        setEditingId(null);

        setFormData({
            ...emptyForm,
            date: getTodayISO(),
        });
    };


    // ==============================
    // FORM CHANGE
    // ==============================

    const handleFormChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };


    // ==============================
    // FORM SUBMIT
    // ==============================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (
            !formData.amount ||
            Number(formData.amount) <= 0
        ) {
            setError(
                "Amount must be greater than 0."
            );

            return;
        }

        if (!formData.source.trim()) {
            setError(
                "Income source is required."
            );

            return;
        }

        if (!formData.category) {
            setError(
                "Please select a category."
            );

            return;
        }

        if (!formData.paymentMethod) {
            setError(
                "Please select a payment method."
            );

            return;
        }

        if (!formData.date) {
            setError(
                "Please select a date."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");

            const transactionData = {
                type: "income",

                amount:
                    Number(
                        formData.amount
                    ),

                category:
                    formData.category,

                description:
                    formData.source.trim(),

                date:
                    formData.date,

                paymentMethod:
                    formData.paymentMethod,

                notes: "",
            };


            // EDIT
            if (editingId !== null) {
                await updateTransaction(
                    editingId,
                    transactionData
                );
            }

            // ADD
            else {
                await createTransaction(
                    transactionData
                );
            }


            await fetchIncome();

            closeModal();
        } catch (error) {
            console.error(
                "Save income error:",
                error.message
            );

            setError(error.message);
        } finally {
            setSaving(false);
        }
    };


    // ==============================
    // DELETE
    // ==============================

    const handleDelete = async (id) => {
        const shouldDelete =
            window.confirm(
                "Are you sure you want to delete this income entry?"
            );

        if (!shouldDelete) {
            return;
        }

        try {
            setDeletingId(id);

            setError("");

            await deleteTransaction(id);

            setIncomeData(
                (current) =>
                    current.filter(
                        (income) =>
                            income.id !== id
                    )
            );
        } catch (error) {
            console.error(
                "Delete income error:",
                error.message
            );

            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    };


    // ==============================
    // CLEAR FILTERS
    // ==============================

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setPaymentMethod("");
        setDateSort("newest");
    };


    // ==============================
    // LOADING
    // ==============================

    if (loading) {
        return (
            <div className="min-h-screen bg-primary px-6 py-8">
                <div className="flex min-h-[60vh] items-center justify-center">
                    <div className="rounded-2xl bg-secondary px-8 py-6 text-center shadow-sm">
                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600" />

                        <p className="mt-4 font-medium text-text-primary">
                            Loading income...
                        </p>
                    </div>
                </div>
            </div>
        );
    }


    // ==============================
    // UI
    // ==============================

    return (
        <div className="min-h-screen bg-primary px-6 py-8">

            {/* Header */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <h1 className="text-4xl font-bold text-text-primary">
                        Income
                    </h1>

                    <p className="mt-2 text-lg text-text-secondary">
                        Track and manage your income.
                    </p>
                </div>


                <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                    <FaPlus />

                    Add Income
                </button>
            </div>


            {/* Error */}

            {error && (
                <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="cursor-pointer"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}


            {/* Summary Cards */}

            <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    icon={FaWallet}
                    iconBackground="bg-green-100"
                    title="Total Income"
                    value={formatMoney(
                        totalIncome
                    )}
                    note="All income entries"
                />

                <SummaryCard
                    icon={FaCalendarAlt}
                    iconBackground="bg-purple-100"
                    title="This Month"
                    value={formatMoney(
                        currentMonthIncome
                    )}
                    note={new Date().toLocaleDateString(
                        "en-IN",
                        {
                            month: "long",
                            year: "numeric",
                        }
                    )}
                />

                <SummaryCard
                    icon={FaChartLine}
                    iconBackground="bg-blue-100"
                    title="Monthly Avg."
                    value={formatMoney(
                        monthlyAverage
                    )}
                    note="Average of months shown"
                />

                <SummaryCard
                    icon={FaUsers}
                    iconBackground="bg-yellow-100"
                    title="Income Sources"
                    value={String(
                        sourceCount
                    )}
                    note="Different sources"
                />
            </div>


            {/* Income Table */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

                {/* Search and Filters */}

                <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-4">

                    <input
                        type="search"
                        placeholder="Search income..."
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        className="min-w-0 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        aria-label="Search income"
                    />


                    <select
                        value={category}
                        onChange={(event) =>
                            setCategory(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        aria-label="Filter by category"
                    >
                        <option value="">
                            All Categories
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}
                    </select>


                    <select
                        value={paymentMethod}
                        onChange={(event) =>
                            setPaymentMethod(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        aria-label="Filter by payment method"
                    >
                        <option value="">
                            All Payment Methods
                        </option>

                        {paymentMethods.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}
                    </select>


                    <select
                        value={dateSort}
                        onChange={(event) =>
                            setDateSort(
                                event.target.value
                            )
                        }
                        className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                        aria-label="Sort by date"
                    >
                        <option value="newest">
                            Date: Newest first
                        </option>

                        <option value="oldest">
                            Date: Oldest first
                        </option>
                    </select>
                </div>


                {/* Table */}

                <div className="overflow-x-auto">

                    <table className="w-full min-w-190">

                        <thead>
                            <tr className="bg-slate-50 text-left">

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Date
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Source
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Category
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Payment Method
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Amount
                                </th>

                                <th className="px-4 py-4 text-sm font-semibold">
                                    Actions
                                </th>

                            </tr>
                        </thead>


                        <tbody>

                            {filteredIncome.map(
                                (income) => (
                                    <tr
                                        key={
                                            income.id
                                        }
                                        className="border-b border-slate-100 hover:bg-slate-50"
                                    >

                                        <td className="px-4 py-4 text-sm">
                                            {formatDate(
                                                income.date
                                            )}
                                        </td>


                                        <td className="px-4 py-4 font-medium">
                                            {
                                                income.source
                                            }
                                        </td>


                                        <td className="px-4 py-4">

                                            <span className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm text-purple-700">
                                                {
                                                    income.category
                                                }
                                            </span>

                                        </td>


                                        <td className="px-4 py-4 text-sm">
                                            {
                                                income.paymentMethod
                                            }
                                        </td>


                                        <td className="px-4 py-4 font-semibold text-green-600">
                                            +{" "}
                                            {formatMoney(
                                                income.amount
                                            )}
                                        </td>


                                        <td className="px-4 py-4">

                                            <div className="flex gap-2">

                                                {/* Edit */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(
                                                            income
                                                        )
                                                    }
                                                    disabled={
                                                        saving ||
                                                        deletingId !==
                                                            null
                                                    }
                                                    aria-label={`Edit ${income.source}`}
                                                    title="Edit income"
                                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                >
                                                    <FaEdit className="text-lg" />
                                                </button>


                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            income.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        income.id
                                                    }
                                                    aria-label={`Delete ${income.source}`}
                                                    title="Delete income"
                                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                >
                                                    {deletingId ===
                                                    income.id ? (
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-500" />
                                                    ) : (
                                                        <FaTrash className="text-lg" />
                                                    )}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                )
                            )}


                            {filteredIncome.length ===
                                0 && (
                                <tr>

                                    <td
                                        colSpan="6"
                                        className="px-4 py-10 text-center text-slate-500"
                                    >
                                        {incomeData.length ===
                                        0
                                            ? "No income entries found."
                                            : "No income entries match your search or filters."}
                                    </td>

                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>


                {/* Footer */}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        {
                            filteredIncome.length
                        }{" "}
                        of{" "}
                        {
                            incomeData.length
                        }{" "}
                        income entries
                    </p>


                    {(search ||
                        category ||
                        paymentMethod) && (
                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                        >
                            Clear filters
                        </button>
                    )}

                </div>

            </div>


            {/* Add / Edit Modal */}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="income-modal-title"
                        className="my-8 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
                    >

                        {/* Modal Header */}

                        <div className="mb-6 flex items-center justify-between gap-4">

                            <div>

                                <h2
                                    id="income-modal-title"
                                    className="text-2xl font-bold text-slate-900"
                                >
                                    {editingId !==
                                    null
                                        ? "Edit Income"
                                        : "Add Income"}
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Enter the details for this income record.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={saving}
                                aria-label="Close form"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                                <FaTimes />
                            </button>

                        </div>


                        {/* Form */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="flex flex-col gap-4"
                        >

                            {/* Amount */}

                            <div>

                                <label
                                    htmlFor="income-amount"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Amount (₹)
                                </label>

                                <input
                                    id="income-amount"
                                    name="amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    required
                                    value={
                                        formData.amount
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Enter amount"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                                />

                            </div>


                            {/* Source */}

                            <div>

                                <label
                                    htmlFor="income-source"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Source
                                </label>

                                <input
                                    id="income-source"
                                    name="source"
                                    type="text"
                                    required
                                    maxLength={80}
                                    value={
                                        formData.source
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="e.g. Salary from ABC Company"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                                />

                            </div>


                            {/* Category + Payment */}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>

                                    <label
                                        htmlFor="income-category"
                                        className="mb-1 block text-sm font-medium text-slate-700"
                                    >
                                        Category
                                    </label>

                                    <select
                                        id="income-category"
                                        name="category"
                                        required
                                        value={
                                            formData.category
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map(
                                            (
                                                item
                                            ) => (
                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {
                                                        item
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>


                                <div>

                                    <label
                                        htmlFor="income-payment-method"
                                        className="mb-1 block text-sm font-medium text-slate-700"
                                    >
                                        Payment Method
                                    </label>

                                    <select
                                        id="income-payment-method"
                                        name="paymentMethod"
                                        required
                                        value={
                                            formData.paymentMethod
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                                    >
                                        <option value="">
                                            Select payment method
                                        </option>

                                        {paymentMethods.map(
                                            (
                                                item
                                            ) => (
                                                <option
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {
                                                        item
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>

                                </div>

                            </div>


                            {/* Date */}

                            <div>

                                <label
                                    htmlFor="income-date"
                                    className="mb-1 block text-sm font-medium text-slate-700"
                                >
                                    Date
                                </label>

                                <input
                                    id="income-date"
                                    name="date"
                                    type="date"
                                    required
                                    value={
                                        formData.date
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
                                />

                            </div>


                            {/* Buttons */}

                            <div className="mt-2 flex justify-end gap-3">

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId !==
                                          null
                                        ? "Save Changes"
                                        : "Add Income"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}


// ==============================
// SUMMARY CARD
// ==============================

function SummaryCard({
    icon: Icon,
    iconBackground,
    title,
    value,
    note,
}) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-4">

                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBackground}`}
                >
                    <Icon className="text-2xl text-primary" />
                </div>


                <div>

                    <p className="text-sm text-slate-600">
                        {title}
                    </p>

                    <h2 className="text-2xl font-bold text-slate-900">
                        {value}
                    </h2>

                    <p className="text-sm text-slate-500">
                        {note}
                    </p>

                </div>

            </div>

        </div>
    );
}


export default Income;