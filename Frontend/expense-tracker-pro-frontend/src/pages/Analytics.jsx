import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    FaWallet,
    FaMoneyBillWave,
    FaPiggyBank,
    FaChartLine,
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
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from "recharts";

import { getTransactions } from "../services/transactionService";


// =====================================================
// CHART COLORS
// =====================================================

const chartColors = [
    "#6366f1",
    "#22c55e",
    "#f97316",
    "#ec4899",
    "#06b6d4",
    "#a855f7",
    "#eab308",
    "#64748b",
];


// =====================================================
// FORMAT MONEY
// =====================================================

const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })}`;


// =====================================================
// PARSE DATE
// Handles:
// 2026-10-20
// 2026-10-20T00:00:00.000Z
// =====================================================

const parseDate = (dateValue) => {
    if (!dateValue) {
        return null;
    }

    const dateString = String(dateValue);

    // Handle YYYY-MM-DD and MongoDB ISO dates
    if (dateString.length >= 10) {
        const firstTenCharacters = dateString.slice(0, 10);

        const parts = firstTenCharacters.split("-");

        if (parts.length === 3) {
            const year = Number(parts[0]);
            const month = Number(parts[1]);
            const day = Number(parts[2]);

            if (
                !Number.isNaN(year) &&
                !Number.isNaN(month) &&
                !Number.isNaN(day)
            ) {
                return new Date(
                    year,
                    month - 1,
                    day
                );
            }
        }
    }

    // Fallback
    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
};


// =====================================================
// CONVERT DATE TO YYYY-MM-DD
// =====================================================

const toISODate = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


// =====================================================
// GET DATE RANGE
// =====================================================

const getDateRange = (range) => {
    const today = new Date();

    // IMPORTANT:
    // Include the complete current day.
    today.setHours(
        23,
        59,
        59,
        999
    );

    let startDate = new Date(today);

    if (range === "7days") {
        startDate = new Date(today);

        startDate.setHours(
            0,
            0,
            0,
            0
        );

        startDate.setDate(
            today.getDate() - 6
        );
    }

    else if (range === "thisMonth") {
        startDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

        startDate.setHours(
            0,
            0,
            0,
            0
        );
    }

    else if (range === "3months") {
        startDate = new Date(
            today.getFullYear(),
            today.getMonth() - 2,
            1
        );

        startDate.setHours(
            0,
            0,
            0,
            0
        );
    }

    else if (range === "thisYear") {
        startDate = new Date(
            today.getFullYear(),
            0,
            1
        );

        startDate.setHours(
            0,
            0,
            0,
            0
        );
    }

    return {
        startDate,
        endDate: today,
    };
};


// =====================================================
// GET BREAKDOWN
// =====================================================

const getBreakdown = (
    expenseData,
    property
) => {
    const totals = {};

    expenseData.forEach(
        (transaction) => {
            const key =
                transaction[property];

            if (!key) {
                return;
            }

            totals[key] =
                (totals[key] || 0) +
                Number(transaction.amount || 0);
        }
    );

    return Object.entries(totals)
        .map(
            ([name, value]) => ({
                name,
                value,
            })
        )
        .sort(
            (a, b) =>
                b.value - a.value
        );
};


// =====================================================
// GET TREND DATA
// =====================================================

const getTrendData = (
    filteredTransactions,
    range,
    startDate,
    endDate
) => {
    const buckets = [];


    // -------------------------------------------------
    // LAST 7 DAYS
    // -------------------------------------------------

    if (range === "7days") {
        for (
            let i = 0;
            i < 7;
            i++
        ) {
            const date =
                new Date(startDate);

            date.setDate(
                startDate.getDate() + i
            );

            const key =
                toISODate(date);

            buckets.push({
                key,

                label:
                    date.toLocaleDateString(
                        "en-IN",
                        {
                            day: "2-digit",
                            month: "short",
                        }
                    ),

                income: 0,

                expenses: 0,
            });
        }
    }


    // -------------------------------------------------
    // THIS MONTH
    // -------------------------------------------------

    else if (
        range === "thisMonth"
    ) {
        const numberOfWeeks =
            Math.ceil(
                endDate.getDate() / 7
            );

        for (
            let week = 1;
            week <= numberOfWeeks;
            week++
        ) {
            buckets.push({
                key: `week-${week}`,

                label: `Week ${week}`,

                income: 0,

                expenses: 0,
            });
        }
    }


    // -------------------------------------------------
    // 3 MONTHS / THIS YEAR
    // -------------------------------------------------

    else {
        const cursor =
            new Date(
                startDate.getFullYear(),
                startDate.getMonth(),
                1
            );

        while (
            cursor <= endDate
        ) {
            const key =
                `${cursor.getFullYear()}-${String(
                    cursor.getMonth() + 1
                ).padStart(2, "0")}`;

            buckets.push({
                key,

                label:
                    cursor.toLocaleDateString(
                        "en-IN",
                        {
                            month: "short",
                            year:
                                range ===
                                "thisYear"
                                    ? undefined
                                    : "2-digit",
                        }
                    ),

                income: 0,

                expenses: 0,
            });

            cursor.setMonth(
                cursor.getMonth() + 1
            );
        }
    }


    // -------------------------------------------------
    // PUT TRANSACTIONS INTO BUCKETS
    // -------------------------------------------------

    filteredTransactions.forEach(
        (transaction) => {
            const date =
                parseDate(
                    transaction.date
                );

            if (!date) {
                return;
            }

            let key;


            // Last 7 days
            if (
                range === "7days"
            ) {
                key =
                    toISODate(date);
            }


            // This month
            else if (
                range === "thisMonth"
            ) {
                key =
                    `week-${Math.ceil(
                        date.getDate() / 7
                    )}`;
            }


            // 3 months / this year
            else {
                key =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;
            }


            const bucket =
                buckets.find(
                    (item) =>
                        item.key === key
                );


            if (!bucket) {
                return;
            }


            if (
                transaction.type ===
                "income"
            ) {
                bucket.income +=
                    Number(
                        transaction.amount || 0
                    );
            }

            else if (
                transaction.type ===
                "expense"
            ) {
                bucket.expenses +=
                    Number(
                        transaction.amount || 0
                    );
            }
        }
    );


    return buckets;
};


// =====================================================
// SUMMARY CARD
// =====================================================

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


// =====================================================
// CHART CARD
// =====================================================

function ChartCard({
    title,
    subtitle,
    children,
}) {
    return (
        <div className="min-w-0 rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="text-lg font-bold text-slate-900">
                {title}
            </h2>

            <p className="mb-5 mt-1 text-sm text-slate-500">
                {subtitle}
            </p>

            {children}

        </div>
    );
}


// =====================================================
// INSIGHT CARD
// =====================================================

function Insight({
    title,
    value,
    description,
}) {
    return (
        <div className="rounded-xl border border-slate-100 p-4">

            <p className="text-sm text-slate-500">
                {title}
            </p>

            <h3 className="mt-2 text-lg font-bold text-slate-900">
                {value}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
                {description}
            </p>

        </div>
    );
}


// =====================================================
// EMPTY CHART MESSAGE
// =====================================================

function EmptyChartMessage() {
    return (
        <div className="flex h-62.5 items-center justify-center text-center text-sm text-slate-500">
            No expense data available for this period.
        </div>
    );
}


// =====================================================
// ANALYTICS PAGE
// =====================================================

function Analytics() {

    // -------------------------------------------------
    // SELECTED DATE RANGE
    // -------------------------------------------------

    const [
        dateRange,
        setDateRange,
    ] = useState(
        "thisMonth"
    );


    // -------------------------------------------------
    // TRANSACTIONS
    // -------------------------------------------------

    const [
        transactions,
        setTransactions,
    ] = useState([]);


    // -------------------------------------------------
    // LOADING
    // -------------------------------------------------

    const [
        loading,
        setLoading,
    ] = useState(true);


    // -------------------------------------------------
    // ERROR
    // -------------------------------------------------

    const [
        error,
        setError,
    ] = useState("");


    // =================================================
    // FETCH TRANSACTIONS
    // =================================================

    useEffect(() => {

        const fetchTransactions =
            async () => {

                try {
                    setLoading(true);

                    setError("");


                    const data =
                        await getTransactions();


                    console.log(
                        "Analytics API response:",
                        data
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Your transactionService returns
                     * the API response directly.
                     *
                     * If backend returns:
                     *
                     * [
                     *   {...},
                     *   {...}
                     * ]
                     *
                     * then data is already an array.
                     */

                    if (
                        Array.isArray(data)
                    ) {
                        setTransactions(
                            data
                        );
                    }

                    /*
                     * This also supports an API response
                     * like:
                     *
                     * {
                     *   transactions: [...]
                     * }
                     */

                    else if (
                        Array.isArray(
                            data?.transactions
                        )
                    ) {
                        setTransactions(
                            data.transactions
                        );
                    }

                    else {
                        setTransactions([]);
                    }

                }

                catch (error) {

                    console.error(
                        "Fetch transactions error:",
                        error
                    );

                    setError(
                        error.message ||
                        "Failed to load transactions"
                    );

                    setTransactions([]);
                }

                finally {
                    setLoading(false);
                }
            };


        fetchTransactions();

    }, []);


    // =================================================
    // CALCULATE ANALYTICS
    // =================================================

    const selectedData =
        useMemo(() => {

            const {
                startDate,
                endDate,
            } =
                getDateRange(
                    dateRange
                );


            // -----------------------------------------
            // FILTER TRANSACTIONS BY DATE
            // -----------------------------------------

            const filteredTransactions =
                transactions.filter(
                    (transaction) => {

                        const date =
                            parseDate(
                                transaction.date
                            );


                        if (!date) {
                            return false;
                        }


                        return (
                            date >=
                                startDate &&
                            date <=
                                endDate
                        );
                    }
                );


            // -----------------------------------------
            // INCOME
            // -----------------------------------------

            const incomeData =
                filteredTransactions.filter(
                    (transaction) =>
                        transaction.type ===
                        "income"
                );


            // -----------------------------------------
            // EXPENSES
            // -----------------------------------------

            const expenseData =
                filteredTransactions.filter(
                    (transaction) =>
                        transaction.type ===
                        "expense"
                );


            // -----------------------------------------
            // TOTAL INCOME
            // -----------------------------------------

            const totalIncome =
                incomeData.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );


            // -----------------------------------------
            // TOTAL EXPENSES
            // -----------------------------------------

            const totalExpenses =
                expenseData.reduce(
                    (sum, item) =>
                        sum +
                        Number(
                            item.amount || 0
                        ),
                    0
                );


            // -----------------------------------------
            // NET SAVINGS
            // -----------------------------------------

            const netSavings =
                totalIncome -
                totalExpenses;


            // -----------------------------------------
            // SAVINGS RATE
            // -----------------------------------------

            const savingsRate =
                totalIncome > 0
                    ? (
                          netSavings /
                          totalIncome
                      ) *
                      100
                    : 0;


            // -----------------------------------------
            // EXPENSES BY CATEGORY
            // -----------------------------------------

            const categoryData =
                getBreakdown(
                    expenseData,
                    "category"
                );


            // -----------------------------------------
            // EXPENSES BY PAYMENT METHOD
            // -----------------------------------------

            const paymentData =
                getBreakdown(
                    expenseData,
                    "paymentMethod"
                );


            // -----------------------------------------
            // TREND DATA
            // -----------------------------------------

            const trendData =
                getTrendData(
                    filteredTransactions,
                    dateRange,
                    startDate,
                    endDate
                );


            // -----------------------------------------
            // DAYS IN PERIOD
            // -----------------------------------------

            const daysInPeriod =
                Math.floor(
                    (
                        endDate.getTime() -
                        startDate.getTime()
                    ) /
                        (
                            1000 *
                            60 *
                            60 *
                            24
                        )
                ) + 1;


            // -----------------------------------------
            // DAILY AVERAGE
            // -----------------------------------------

            const dailyAverage =
                totalExpenses /
                Math.max(
                    daysInPeriod,
                    1
                );


            return {
                filteredTransactions,

                totalIncome,

                totalExpenses,

                netSavings,

                savingsRate,

                categoryData,

                paymentData,

                trendData,

                dailyAverage,
            };

        }, [
            dateRange,
            transactions,
        ]);


    // =================================================
    // DESTRUCTURE ANALYTICS
    // =================================================

    const {
        filteredTransactions,
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate,
        categoryData,
        paymentData,
        trendData,
        dailyAverage,
    } = selectedData;


    // =================================================
    // TOP CATEGORY
    // =================================================

    const highestCategory =
        categoryData[0];


    // =================================================
    // TOP PAYMENT METHOD
    // =================================================

    const highestPaymentMethod =
        paymentData[0];


    // =================================================
    // RANGE LABELS
    // =================================================

    const rangeLabels = {
        "7days": "Last 7 days",

        thisMonth: "This month",

        "3months": "Last 3 months",

        thisYear: "This year",
    };


    // =================================================
    // LOADING SCREEN
    // =================================================

    if (loading) {
        return (
            <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">

                <div className="flex min-h-[60vh] items-center justify-center">

                    <div className="text-center">

                        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />

                        <p className="mt-4 text-text-secondary">
                            Loading analytics...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // =================================================
    // ERROR SCREEN
    // =================================================

    if (error) {
        return (
            <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">

                <div className="flex min-h-[60vh] items-center justify-center">

                    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-sm">

                        <h1 className="text-xl font-bold text-red-600">
                            Failed to load analytics
                        </h1>

                        <p className="mt-2 text-slate-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="mt-5 rounded-xl bg-primary px-5 py-3 font-medium text-white cursor-pointer"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    // =================================================
    // MAIN PAGE
    // =================================================

    return (
        <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">

            {/* =========================================
                HEADER
            ========================================== */}

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                        Analytics
                    </h1>

                    <p className="mt-2 text-text-secondary">
                        Understand your financial habits and spending.
                    </p>

                </div>


                {/* DATE FILTER */}

                <div>

                    <label
                        htmlFor="analytics-range"
                        className="mb-2 block text-sm font-medium text-text-secondary"
                    >
                        Select time period
                    </label>

                    <select
                        id="analytics-range"
                        value={dateRange}
                        onChange={(event) =>
                            setDateRange(
                                event.target.value
                            )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 sm:w-48"
                    >

                        <option value="7days">
                            Last 7 days
                        </option>

                        <option value="thisMonth">
                            This month
                        </option>

                        <option value="3months">
                            Last 3 months
                        </option>

                        <option value="thisYear">
                            This year
                        </option>

                    </select>

                </div>

            </div>


            {/* =========================================
                SUMMARY CARDS
            ========================================== */}

            <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

                <SummaryCard
                    icon={FaWallet}
                    title="Total Income"
                    value={formatMoney(
                        totalIncome
                    )}
                    note={
                        rangeLabels[
                            dateRange
                        ]
                    }
                    color="bg-green-100 text-green-600"
                />


                <SummaryCard
                    icon={FaMoneyBillWave}
                    title="Total Expenses"
                    value={formatMoney(
                        totalExpenses
                    )}
                    note={
                        rangeLabels[
                            dateRange
                        ]
                    }
                    color="bg-red-100 text-red-600"
                />


                <SummaryCard
                    icon={FaPiggyBank}
                    title="Net Savings"
                    value={formatMoney(
                        netSavings
                    )}
                    note="Income minus expenses"
                    color="bg-blue-100 text-blue-600"
                />


                <SummaryCard
                    icon={FaChartLine}
                    title="Savings Rate"
                    value={`${savingsRate.toFixed(
                        1
                    )}%`}
                    note="Savings relative to income"
                    color="bg-purple-100 text-purple-600"
                />

            </div>


            {/* =========================================
                FIRST ROW CHARTS
            ========================================== */}

            <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2">


                {/* INCOME VS EXPENSES */}

                <ChartCard
                    title="Income vs Expenses"
                    subtitle="Compare money earned and spent"
                >

                    {trendData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <BarChart
                                data={trendData}
                                margin={{
                                    top: 10,
                                    right: 8,
                                    left: 8,
                                    bottom: 5,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    tickFormatter={(value) =>
                                        value >= 1000
                                            ? `₹${Math.round(
                                                  value /
                                                      1000
                                              )}k`
                                            : `₹${value}`
                                    }
                                    tick={{
                                        fontSize: 12,
                                    }}
                                    width={65}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatMoney(
                                            Number(value)
                                        )
                                    }
                                />

                                <Legend />


                                <Bar
                                    dataKey="income"
                                    name="Income"
                                    fill="#22c55e"
                                    radius={[
                                        5,
                                        5,
                                        0,
                                        0,
                                    ]}
                                />


                                <Bar
                                    dataKey="expenses"
                                    name="Expenses"
                                    fill="#ef4444"
                                    radius={[
                                        5,
                                        5,
                                        0,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    ) : (
                        <EmptyChartMessage />
                    )}

                </ChartCard>


                {/* EXPENSES BY CATEGORY */}

                <ChartCard
                    title="Expenses by Category"
                    subtitle="See where most of your money goes"
                >

                    {categoryData.length > 0 ? (

                        <>

                            <ResponsiveContainer
                                width="100%"
                                height={250}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            categoryData
                                        }
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={95}
                                        paddingAngle={3}
                                    >

                                        {categoryData.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <Cell
                                                    key={
                                                        item.name
                                                    }
                                                    fill={
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) =>
                                            formatMoney(
                                                Number(
                                                    value
                                                )
                                            )
                                        }
                                    />

                                </PieChart>

                            </ResponsiveContainer>


                            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">

                                {categoryData.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                item.name
                                            }
                                            className="flex items-center gap-2 text-sm text-slate-600"
                                        >

                                            <span
                                                className="h-3 w-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ],
                                                }}
                                            />

                                            {item.name}

                                        </div>

                                    )
                                )}

                            </div>

                        </>

                    ) : (
                        <EmptyChartMessage />
                    )}

                </ChartCard>

            </div>


            {/* =========================================
                SECOND ROW CHARTS
            ========================================== */}

            <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-2">


                {/* SPENDING TREND */}

                <ChartCard
                    title="Spending Trend"
                    subtitle="Track expenses over the selected period"
                >

                    {trendData.length > 0 ? (

                        <ResponsiveContainer
                            width="100%"
                            height={300}
                        >

                            <LineChart
                                data={trendData}
                                margin={{
                                    top: 10,
                                    right: 8,
                                    left: 8,
                                    bottom: 5,
                                }}
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 12,
                                    }}
                                />

                                <YAxis
                                    tickFormatter={(value) =>
                                        value >= 1000
                                            ? `₹${Math.round(
                                                  value /
                                                      1000
                                              )}k`
                                            : `₹${value}`
                                    }
                                    tick={{
                                        fontSize: 12,
                                    }}
                                    width={65}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        formatMoney(
                                            Number(value)
                                        )
                                    }
                                />

                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    name="Expenses"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    dot={{
                                        r: 4,
                                    }}
                                    activeDot={{
                                        r: 6,
                                    }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    ) : (
                        <EmptyChartMessage />
                    )}

                </ChartCard>


                {/* PAYMENT METHODS */}

                <ChartCard
                    title="Payment Methods"
                    subtitle="How you pay for your expenses"
                >

                    {paymentData.length > 0 ? (

                        <>

                            <ResponsiveContainer
                                width="100%"
                                height={250}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            paymentData
                                        }
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={95}
                                        paddingAngle={3}
                                    >

                                        {paymentData.map(
                                            (
                                                item,
                                                index
                                            ) => (
                                                <Cell
                                                    key={
                                                        item.name
                                                    }
                                                    fill={
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip
                                        formatter={(
                                            value
                                        ) =>
                                            formatMoney(
                                                Number(
                                                    value
                                                )
                                            )
                                        }
                                    />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </>

                    ) : (
                        <EmptyChartMessage />
                    )}

                </ChartCard>

            </div>


            {/* =========================================
                FINANCIAL INSIGHTS
            ========================================== */}

            <div className="mb-7 rounded-2xl bg-white p-5 shadow-sm">

                <h2 className="text-xl font-bold text-slate-900">
                    Financial Insights
                </h2>

                <p className="mb-5 mt-1 text-sm text-slate-500">
                    A quick summary of your financial activity.
                </p>


                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                    {/* HIGHEST CATEGORY */}

                    <Insight
                        title="Highest Spending Category"
                        value={
                            highestCategory
                                ? highestCategory.name
                                : "No expenses yet"
                        }
                        description={
                            highestCategory
                                ? `${formatMoney(
                                      highestCategory.value
                                  )} spent in ${highestCategory.name}.`
                                : "Add expenses to see your top category."
                        }
                    />


                    {/* DAILY AVERAGE */}

                    <Insight
                        title="Daily Average Spending"
                        value={formatMoney(
                            dailyAverage
                        )}
                        description="Average expenses per day in the selected period."
                    />


                    {/* SAVINGS STATUS */}

                    <Insight
                        title="Savings Status"
                        value={
                            netSavings >= 0
                                ? "Positive"
                                : "Spending exceeds income"
                        }
                        description={
                            netSavings >= 0
                                ? `You have ${formatMoney(
                                      netSavings
                                  )} left after expenses.`
                                : `Your expenses exceed income by ${formatMoney(
                                      Math.abs(
                                          netSavings
                                      )
                                  )}.`
                        }
                    />


                    {/* PAYMENT METHOD */}

                    <Insight
                        title="Most Used Payment Method"
                        value={
                            highestPaymentMethod
                                ? highestPaymentMethod.name
                                : "No expenses yet"
                        }
                        description={
                            highestPaymentMethod
                                ? `${formatMoney(
                                      highestPaymentMethod.value
                                  )} in expenses used this method.`
                                : "Add expenses to see your payment habits."
                        }
                    />

                </div>

            </div>


            {/* =========================================
                CATEGORY BREAKDOWN
            ========================================== */}

            <div className="rounded-2xl bg-white p-5 shadow-sm">

                <h2 className="text-xl font-bold text-slate-900">
                    Category Breakdown
                </h2>

                <p className="mb-5 mt-1 text-sm text-slate-500">
                    Expense distribution for{" "}
                    {
                        rangeLabels[
                            dateRange
                        ]
                    }.
                </p>


                <div className="overflow-x-auto">

                    <table className="w-full min-w-112.5">

                        <thead>

                            <tr className="bg-slate-50 text-left">

                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                    Category
                                </th>

                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                    Amount
                                </th>

                                <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                                    Percentage
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {categoryData.map(
                                (item) => {

                                    const percentage =
                                        totalExpenses >
                                        0
                                            ? (
                                                  item.value /
                                                  totalExpenses
                                              ) *
                                              100
                                            : 0;


                                    return (
                                        <tr
                                            key={
                                                item.name
                                            }
                                            className="border-b border-slate-100"
                                        >

                                            <td className="px-4 py-4 font-medium text-slate-800">
                                                {
                                                    item.name
                                                }
                                            </td>


                                            <td className="px-4 py-4 font-semibold text-slate-800">
                                                {formatMoney(
                                                    item.value
                                                )}
                                            </td>


                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">

                                                        <div
                                                            className="h-full rounded-full bg-indigo-500"
                                                            style={{
                                                                width: `${Math.min(
                                                                    percentage,
                                                                    100
                                                                )}%`,
                                                            }}
                                                        />

                                                    </div>


                                                    <span className="text-sm text-slate-600">
                                                        {percentage.toFixed(
                                                            1
                                                        )}
                                                        %
                                                    </span>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}


                            {categoryData.length ===
                                0 && (
                                <tr>

                                    <td
                                        colSpan={3}
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        No expenses found for this period.
                                    </td>

                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>


                {/* TRANSACTION COUNT */}

                <p className="mt-4 text-sm text-slate-500">
                    Analyzed{" "}
                    {
                        filteredTransactions.length
                    }{" "}
                    transactions in the selected period.
                </p>

            </div>

        </div>
    );
}

export default Analytics;