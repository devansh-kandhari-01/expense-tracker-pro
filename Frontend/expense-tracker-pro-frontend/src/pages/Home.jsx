import { useEffect, useMemo, useState } from "react";

import {
    FaWallet,
    FaArrowUp,
    FaArrowDown,
    FaPiggyBank,
    FaPlus,
    FaMoneyBillWave,
} from "react-icons/fa";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

import { Link } from "react-router-dom";

import { getTransactions } from "../services/transactionService";
import { getBudgets } from "../services/budgetService";


const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;


const parseDate = (dateValue) => {
    if (!dateValue) {
        return new Date();
    }

    const dateString = String(dateValue);

    if (dateString.length >= 10) {
        const [year, month, day] = dateString
            .slice(0, 10)
            .split("-")
            .map(Number);

        return new Date(year, month - 1, day);
    }

    return new Date(dateValue);
};


const getMonthKey = (dateValue) => {
    const date = parseDate(dateValue);

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}`;
};


const getMonthName = (dateValue) => {
    const date = parseDate(dateValue);

    return date.toLocaleString("en-US", {
        month: "short",
    });
};


function Home() {

    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    /*
    ==========================================
    FETCH TRANSACTIONS + BUDGETS
    ==========================================
    */

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                setLoading(true);
                setError("");

                const [
                    transactionData,
                    budgetData,
                ] = await Promise.all([
                    getTransactions(),
                    getBudgets(),
                ]);


                setTransactions(
                    transactionData.transactions || []
                );

                setBudgets(
                    budgetData.budgets || []
                );

            } catch (error) {

                console.error(
                    "Dashboard fetch error:",
                    error.message
                );

                setError(error.message);

            } finally {

                setLoading(false);

            }

        };


        fetchDashboardData();

    }, []);


    /*
    ==========================================
    SUMMARY
    ==========================================
    */

    const summary = useMemo(() => {

        const totalIncome = transactions
            .filter(
                (transaction) =>
                    transaction.type === "income"
            )
            .reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount || 0),
                0
            );


        const totalExpenses = transactions
            .filter(
                (transaction) =>
                    transaction.type === "expense"
            )
            .reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount || 0),
                0
            );


        const balance =
            totalIncome - totalExpenses;


        return {
            totalIncome,
            totalExpenses,
            balance,
        };

    }, [transactions]);


    /*
    ==========================================
    MONTHLY CHART DATA
    ==========================================
    */

    const chartData = useMemo(() => {

        const monthlyData = {};


        transactions.forEach((transaction) => {

            const monthKey =
                getMonthKey(transaction.date);

            if (!monthlyData[monthKey]) {

                monthlyData[monthKey] = {
                    monthKey,
                    month: getMonthName(
                        transaction.date
                    ),
                    income: 0,
                    expenses: 0,
                };

            }


            if (
                transaction.type ===
                "income"
            ) {

                monthlyData[monthKey].income +=
                    Number(transaction.amount || 0);

            }


            if (
                transaction.type ===
                "expense"
            ) {

                monthlyData[monthKey].expenses +=
                    Number(transaction.amount || 0);

            }

        });


        return Object.values(monthlyData)
            .sort((a, b) =>
                a.monthKey.localeCompare(
                    b.monthKey
                )
            )
            .slice(-6);

    }, [transactions]);


    /*
    ==========================================
    CURRENT MONTH
    ==========================================
    */

    const currentMonth = new Date();

    const currentMonthKey =
        `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
        ).padStart(2, "0")}`;


    /*
    ==========================================
    BUDGET OVERVIEW
    ==========================================
    */

    const budgetOverview = useMemo(() => {

        return budgets
            .filter(
                (budget) =>
                    budget.month ===
                    currentMonthKey
            )
            .map((budget) => {

                const spent =
                    transactions
                        .filter(
                            (transaction) =>
                                transaction.type ===
                                    "expense" &&
                                transaction.category ===
                                    budget.category &&
                                getMonthKey(
                                    transaction.date
                                ) ===
                                    budget.month
                        )
                        .reduce(
                            (sum, transaction) =>
                                sum +
                                Number(
                                    transaction.amount ||
                                        0
                                ),
                            0
                        );


                const budgetAmount =
                    Number(
                        budget.amount || 0
                    );


                const percentage =
                    budgetAmount > 0
                        ? (spent / budgetAmount) *
                          100
                        : 0;


                return {
                    ...budget,
                    spent,
                    budget:
                        budgetAmount,
                    percentage,
                };

            })
            .slice(0, 5);

    }, [
        budgets,
        transactions,
        currentMonthKey,
    ]);


    /*
    ==========================================
    RECENT TRANSACTIONS
    ==========================================
    */

    const recentTransactions = useMemo(() => {

        return [...transactions]
            .sort(
                (a, b) =>
                    parseDate(b.date) -
                    parseDate(a.date)
            )
            .slice(0, 5);

    }, [transactions]);


    /*
    ==========================================
    LOADING STATE
    ==========================================
    */

    if (loading) {

        return (
            <div className="min-h-screen bg-primary px-6 py-8">

                <div className="flex min-h-[70vh] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />

                        <p className="mt-4 text-text-secondary">
                            Loading dashboard...
                        </p>

                    </div>

                </div>

            </div>
        );

    }


    /*
    ==========================================
    ERROR STATE
    ==========================================
    */

    if (error) {

        return (
            <div className="min-h-screen bg-primary px-6 py-8">

                <div className="rounded-2xl bg-secondary p-8 text-center">

                    <h1 className="text-2xl font-bold text-text-primary">
                        Unable to load dashboard
                    </h1>

                    <p className="mt-3 text-red-500">
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:opacity-90 cursor-pointer"
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );

    }


    return (
        <div className="min-h-screen bg-primary px-6 py-8">

            {/* ========================================= */}
            {/* HEADER */}
            {/* ========================================= */}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-text-primary">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-text-secondary">
                        Welcome back! Here's your financial overview.
                    </p>

                </div>


                <div className="flex gap-3">

                    <Link
                        to="/expenses"
                        className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-text-primary hover:opacity-90 cursor-pointer"
                    >
                        <FaArrowDown />

                        Add Expense
                    </Link>


                    <Link
                        to="/income"
                        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                    >
                        <FaArrowUp />

                        Add Income
                    </Link>

                </div>

            </div>


            {/* ========================================= */}
            {/* SUMMARY CARDS */}
            {/* ========================================= */}

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    title="Total Balance"
                    amount={formatMoney(
                        summary.balance
                    )}
                    icon={<FaWallet />}
                    iconClass="bg-indigo-100 text-indigo-600"
                />


                <SummaryCard
                    title="Total Income"
                    amount={formatMoney(
                        summary.totalIncome
                    )}
                    icon={<FaArrowUp />}
                    iconClass="bg-green-100 text-green-600"
                />


                <SummaryCard
                    title="Total Expenses"
                    amount={formatMoney(
                        summary.totalExpenses
                    )}
                    icon={<FaArrowDown />}
                    iconClass="bg-red-100 text-red-500"
                />


                <SummaryCard
                    title="Savings"
                    amount={formatMoney(
                        summary.balance
                    )}
                    icon={<FaPiggyBank />}
                    iconClass="bg-yellow-100 text-yellow-600"
                />

            </div>


            {/* ========================================= */}
            {/* CHART + BUDGET */}
            {/* ========================================= */}

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">


                {/* INCOME VS EXPENSE */}

                <div className="rounded-2xl bg-secondary p-6 xl:col-span-2">

                    <div>

                        <h2 className="text-xl font-bold text-text-primary">
                            Income vs Expenses
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your financial activity over the last 6 months
                        </p>

                    </div>


                    <div className="mt-6 h-80">

                        {chartData.length === 0 ? (

                            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                                No transaction data available yet.
                            </div>

                        ) : (

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >

                                <BarChart
                                    data={chartData}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                    />

                                    <XAxis
                                        dataKey="month"
                                    />

                                    <YAxis />

                                    <Tooltip
                                        formatter={(value) =>
                                            formatMoney(
                                                value
                                            )
                                        }
                                    />

                                    <Legend />


                                    <Bar
                                        dataKey="income"
                                        name="Income"
                                        fill="#22c55e"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0,
                                        ]}
                                    />


                                    <Bar
                                        dataKey="expenses"
                                        name="Expenses"
                                        fill="#ef4444"
                                        radius={[
                                            6,
                                            6,
                                            0,
                                            0,
                                        ]}
                                    />

                                </BarChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                </div>


                {/* BUDGET OVERVIEW */}

                <div className="rounded-2xl bg-secondary p-6">

                    <div className="flex items-center justify-between">

                        <div>

                            <h2 className="text-xl font-bold text-text-primary">
                                Budget Overview
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                This month's spending
                            </p>

                        </div>


                        <Link
                            to="/budgets"
                            className="text-sm font-semibold text-indigo-600 hover:underline"
                        >
                            View All
                        </Link>

                    </div>


                    <div className="mt-6 space-y-6">

                        {budgetOverview.length === 0 ? (

                            <div className="rounded-xl bg-slate-50 p-5 text-center">

                                <p className="text-sm text-slate-500">
                                    No budgets created for this month.
                                </p>

                                <Link
                                    to="/budgets"
                                    className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                                >
                                    Create a Budget
                                </Link>

                            </div>

                        ) : (

                            budgetOverview.map(
                                (budget) => {

                                    const percentage =
                                        Math.min(
                                            budget.percentage,
                                            100
                                        );


                                    return (
                                        <div
                                            key={
                                                budget._id ||
                                                `${budget.category}-${budget.month}`
                                            }
                                        >

                                            <div className="flex items-center justify-between">

                                                <p className="font-medium text-text-primary">
                                                    {
                                                        budget.category
                                                    }
                                                </p>


                                                <p className="text-sm text-slate-500">

                                                    {formatMoney(
                                                        budget.spent
                                                    )}

                                                    {" / "}

                                                    {formatMoney(
                                                        budget.budget
                                                    )}

                                                </p>

                                            </div>


                                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                                                <div
                                                    className={`h-full rounded-full ${
                                                        budget.percentage >
                                                        100
                                                            ? "bg-red-500"
                                                            : "bg-indigo-600"
                                                    }`}
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />

                                            </div>


                                            <p
                                                className={`mt-1 text-xs ${
                                                    budget.percentage >
                                                    100
                                                        ? "font-semibold text-red-500"
                                                        : "text-slate-500"
                                                }`}
                                            >
                                                {budget.percentage >
                                                100
                                                    ? `${Math.round(
                                                          budget.percentage
                                                      )}% used — Budget exceeded`
                                                    : `${Math.round(
                                                          budget.percentage
                                                      )}% used`}
                                            </p>

                                        </div>
                                    );

                                }
                            )

                        )}

                    </div>

                </div>

            </div>


            {/* ========================================= */}
            {/* RECENT TRANSACTIONS */}
            {/* ========================================= */}

            <div className="mt-8 rounded-2xl bg-secondary p-6">

                <div className="flex items-center justify-between">

                    <div>

                        <h2 className="text-xl font-bold text-text-primary">
                            Recent Transactions
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Your latest income and expenses
                        </p>

                    </div>


                    <Link
                        to="/analytics"
                        className="text-sm font-semibold text-indigo-600 hover:underline"
                    >
                        View All
                    </Link>

                </div>


                <div className="mt-6 overflow-x-auto">

                    {recentTransactions.length === 0 ? (

                        <div className="rounded-xl bg-slate-50 p-8 text-center">

                            <p className="text-slate-500">
                                No transactions yet.
                            </p>

                            <div className="mt-4 flex justify-center gap-3">

                                <Link
                                    to="/expenses"
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    Add Expense
                                </Link>

                                <Link
                                    to="/income"
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    Add Income
                                </Link>

                            </div>

                        </div>

                    ) : (

                        <table className="w-full min-w-175">

                            <thead>

                                <tr className="border-b border-slate-200 text-left">

                                    <th className="px-4 py-3 text-sm font-semibold text-slate-500">
                                        Description
                                    </th>

                                    <th className="px-4 py-3 text-sm font-semibold text-slate-500">
                                        Category
                                    </th>

                                    <th className="px-4 py-3 text-sm font-semibold text-slate-500">
                                        Date
                                    </th>

                                    <th className="px-4 py-3 text-sm font-semibold text-slate-500">
                                        Type
                                    </th>

                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-500">
                                        Amount
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {recentTransactions.map(
                                    (transaction) => (

                                        <tr
                                            key={
                                                transaction._id
                                            }
                                            className="border-b border-slate-100 last:border-none"
                                        >

                                            <td className="px-4 py-4 font-medium text-text-primary">

                                                {transaction.description ||
                                                    "No description"}

                                            </td>


                                            <td className="px-4 py-4 text-slate-600">

                                                {
                                                    transaction.category
                                                }

                                            </td>


                                            <td className="px-4 py-4 text-slate-600">

                                                {String(
                                                    transaction.date
                                                ).slice(
                                                    0,
                                                    10
                                                )}

                                            </td>


                                            <td className="px-4 py-4">

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        transaction.type ===
                                                        "income"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-600"
                                                    }`}
                                                >

                                                    {transaction.type ===
                                                    "income"
                                                        ? "Income"
                                                        : "Expense"}

                                                </span>

                                            </td>


                                            <td
                                                className={`px-4 py-4 text-right font-semibold ${
                                                    transaction.type ===
                                                    "income"
                                                        ? "text-green-600"
                                                        : "text-red-500"
                                                }`}
                                            >

                                                {transaction.type ===
                                                "income"
                                                    ? "+"
                                                    : "-"}

                                                {formatMoney(
                                                    transaction.amount
                                                )}

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    )}

                </div>

            </div>


            {/* ========================================= */}
            {/* QUICK ACTIONS */}
            {/* ========================================= */}

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">

                <QuickAction
                    to="/expenses"
                    icon={<FaPlus />}
                    title="Add Expense"
                    description="Record a new expense"
                />


                <QuickAction
                    to="/income"
                    icon={<FaMoneyBillWave />}
                    title="Add Income"
                    description="Record a new income"
                />


                <QuickAction
                    to="/budgets"
                    icon={<FaPiggyBank />}
                    title="Manage Budget"
                    description="Set and manage spending limits"
                />

            </div>

        </div>
    );
}


/*
==========================================
SUMMARY CARD
==========================================
*/

function SummaryCard({
    title,
    amount,
    icon,
    iconClass,
}) {

    return (
        <div className="rounded-2xl bg-secondary p-6 shadow-sm">

            <div className="flex items-center justify-between">

                <div>

                    <p className="text-sm text-slate-500">
                        {title}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-text-primary">
                        {amount}
                    </h2>

                </div>


                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconClass}`}
                >
                    {icon}
                </div>

            </div>

        </div>
    );
}


/*
==========================================
QUICK ACTION
==========================================
*/

function QuickAction({
    to,
    icon,
    title,
    description,
}) {

    return (
        <Link
            to={to}
            className="flex items-center gap-4 rounded-2xl bg-secondary p-5 transition hover:-translate-y-1 hover:shadow-md"
        >

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                {icon}
            </div>


            <div>

                <h3 className="font-semibold text-text-primary">
                    {title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    {description}
                </p>

            </div>

        </Link>
    );
}


export default Home;