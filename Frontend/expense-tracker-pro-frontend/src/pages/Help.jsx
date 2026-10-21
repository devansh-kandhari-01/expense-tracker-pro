import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaQuestionCircle,
    FaSearch,
    FaWallet,
    FaMoneyBillWave,
    FaChartPie,
    FaChartLine,
    FaCog,
    FaUserShield,
    FaEnvelope,
    FaPaperPlane,
    FaChevronDown,
    FaChevronUp,
    FaBookOpen,
    FaLightbulb,
    FaBug,
    FaComments,
    FaArrowRight,
    FaInfoCircle,
    FaTimes,
} from "react-icons/fa";

// FAQ data
const faqData = [
    {
        id: 1,
        category: "Getting Started",
        question: "How do I get started with Expense Tracker Pro?",
        answer:
            "Start by adding your income and expenses. Use the Dashboard to review your financial activity, the Budgets page to set spending limits, and the Analytics page to understand your spending patterns.",
    },
    {
        id: 2,
        category: "Expenses",
        question: "How do I add a new expense?",
        answer:
            "Open the Expenses page and select Add Expense. Enter the amount, category, description, date, and payment method, then submit the form. Your expense can then be used in reports and budget calculations once the application is connected to your data source.",
    },
    {
        id: 3,
        category: "Expenses",
        question: "Can I edit or delete an expense?",
        answer:
            "Yes. Use the edit action to update an existing expense or the delete action to remove one. Review the record before deleting it because removing an expense can affect totals and budget calculations.",
    },
    {
        id: 4,
        category: "Income",
        question: "How can I record my income?",
        answer:
            "Open the Income page, choose Add Income, and enter the amount, source, category, date, and payment details required by your form. Examples include salary, freelance payments, investments, and rental income.",
    },
    {
        id: 5,
        category: "Budgets",
        question: "How do budgets work?",
        answer:
            "A budget is a planned spending limit for a category during a particular month. The application can compare eligible expenses with that limit and calculate the amount spent, remaining amount, and percentage used.",
    },
    {
        id: 6,
        category: "Budgets",
        question: "What happens when I exceed a budget?",
        answer:
            "When spending exceeds the budget amount, the remaining amount becomes negative and the budget can be marked as Exceeded. Review the relevant category and its transactions to understand where the extra spending occurred.",
    },
    {
        id: 7,
        category: "Analytics",
        question: "What information does Analytics show?",
        answer:
            "The Analytics page can summarize income, expenses, net savings, savings rate, spending trends, category breakdowns, and payment methods. The results depend on the transaction data and date range available to the application.",
    },
    {
        id: 8,
        category: "Analytics",
        question: "Why do my charts show sample data?",
        answer:
            "During development, pages may use hardcoded sample transactions. Connect the frontend to your backend API and calculate the charts from real user transactions to display your actual financial activity.",
    },
    {
        id: 9,
        category: "Account & Security",
        question: "How do I update my profile information?",
        answer:
            "Open Settings and edit your profile fields. In a connected application, profile updates should be saved through an authenticated backend API so they remain available across sessions and devices.",
    },
    {
        id: 10,
        category: "Account & Security",
        question: "Is my password stored in the browser?",
        answer:
            "Your application should never store a plaintext password in localStorage. Password changes and authentication should be handled securely by the backend, with passwords stored using an appropriate password-hashing method.",
    },
    {
        id: 11,
        category: "Troubleshooting",
        question: "Why are my changes lost after refreshing?",
        answer:
            "If a page stores information only in React state, that information resets when the page reloads. Use a backend API and database for persistent application records. Browser localStorage can persist simple preferences but is not a replacement for secure server-side storage.",
    },
    {
        id: 12,
        category: "Troubleshooting",
        question: "Why are my totals or budgets incorrect?",
        answer:
            "Check that transactions have the correct amount, category, date, and type. Verify that the selected month matches the transaction dates and that income is not being included in expense totals. Also confirm that the page is using real data rather than sample records.",
    },
];

const categories = [
    "All",
    "Getting Started",
    "Expenses",
    "Income",
    "Budgets",
    "Analytics",
    "Account & Security",
    "Troubleshooting",
];

// Quick links to other pages
const quickLinks = [
    {
        title: "Manage Expenses",
        description: "Add, edit, and review your expenses.",
        icon: FaMoneyBillWave,
        to: "/expenses",
        color: "bg-red-100 text-red-600",
    },
    {
        title: "Manage Income",
        description: "Track salary and other income sources.",
        icon: FaWallet,
        to: "/income",
        color: "bg-green-100 text-green-600",
    },
    {
        title: "Manage Budgets",
        description: "Set monthly spending limits.",
        icon: FaChartPie,
        to: "/budgets",
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "View Analytics",
        description: "Explore trends and financial summaries.",
        icon: FaChartLine,
        to: "/analytics",
        color: "bg-purple-100 text-purple-600",
    },
    {
        title: "Account Settings",
        description: "Manage preferences and profile details.",
        icon: FaCog,
        to: "/settings",
        color: "bg-orange-100 text-orange-600",
    },
];

// Support form defaults
const initialContactForm = {
    name: "",
    email: "",
    topic: "General Question",
    subject: "",
    message: "",
};

function Help() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [openFaq, setOpenFaq] = useState(1);
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactForm, setContactForm] = useState(initialContactForm);
    const [formMessage, setFormMessage] = useState("");
    const [formStatus, setFormStatus] = useState("success");

    // Search FAQ questions and answers
    const filteredFaqs = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return faqData.filter((faq) => {
            const matchesCategory =
                selectedCategory === "All" ||
                faq.category === selectedCategory;

            const matchesSearch =
                searchText === "" ||
                faq.question.toLowerCase().includes(searchText) ||
                faq.answer.toLowerCase().includes(searchText) ||
                faq.category.toLowerCase().includes(searchText);

            return matchesCategory && matchesSearch;
        });
    }, [search, selectedCategory]);

    // Update support form fields
    const handleContactChange = (event) => {
        const { name, value } = event.target;

        setContactForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // Handle support form submission
    const handleContactSubmit = (event) => {
        event.preventDefault();

        if (
            !contactForm.name.trim() ||
            !contactForm.email.trim() ||
            !contactForm.subject.trim() ||
            !contactForm.message.trim()
        ) {
            setFormStatus("error");
            setFormMessage("Please complete all required fields.");
            return;
        }

        // Connect this handler to your backend support API later.
        // This demo does not send or store support requests.
        setFormStatus("info");
        setFormMessage(
            "Your form is valid, but support requests are not being sent yet. Connect this form to your backend API to enable submissions."
        );
    };

    const clearContactForm = () => {
        setContactForm({ ...initialContactForm });
        setFormMessage("");
        setFormStatus("success");
    };

    return (
        <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                        <FaQuestionCircle className="text-3xl" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                            Help & Support
                        </h1>

                        <p className="mt-1 text-text-secondary">
                            Find answers and learn how to use your
                            Expense Tracker Pro.
                        </p>
                    </div>
                </div>
            </div>

            {/* Hero Search */}
            <div className="mb-8 rounded-2xl bg-indigo-600 px-5 py-10 text-white sm:px-10 sm:py-12">
                <div className="mx-auto max-w-2xl text-center">
                    <FaBookOpen className="mx-auto mb-4 text-4xl" />

                    <h2 className="text-2xl font-bold sm:text-3xl">
                        How can we help you?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-indigo-100 sm:text-base">
                        Search common questions about expenses,
                        income, budgets, and account settings.
                    </p>

                    <div className="relative mt-7">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search for help..."
                            aria-label="Search frequently asked questions"
                            className="w-full rounded-xl border border-white/20 bg-white py-4 pl-12 pr-4 text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-300"
                        />
                    </div>

                    <p className="mt-4 text-sm text-indigo-100">
                        Popular topics: budgets, expenses, analytics
                    </p>
                </div>
            </div>

            {/* Quick Links */}
            <section className="mb-10">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-text-primary">
                        Quick Help
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Jump directly to the page you need.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {quickLinks.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.title}
                                to={item.to}
                                className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                                >
                                    <Icon className="text-xl" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-slate-900">
                                        {item.title}
                                    </h3>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        {item.description}
                                    </p>
                                </div>

                                <FaArrowRight className="shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-10">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-text-primary">
                        Frequently Asked Questions
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Browse answers by topic or search for a question.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="mb-5 flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setSelectedCategory(category)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer ${
                                selectedCategory === category
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* FAQ Results */}
                <div className="flex flex-col gap-3">
                    {filteredFaqs.map((faq) => {
                        const isOpen = openFaq === faq.id;

                        return (
                            <div
                                key={faq.id}
                                className="overflow-hidden rounded-2xl bg-white shadow-sm"
                            >
                                <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() =>
                                        setOpenFaq(
                                            isOpen ? null : faq.id
                                        )
                                    }
                                    className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6 cursor-pointer"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                            <FaQuestionCircle />
                                        </div>

                                        <div>
                                            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                                                {faq.category}
                                            </span>

                                            <h3 className="mt-1 font-semibold leading-6 text-slate-900">
                                                {faq.question}
                                            </h3>
                                        </div>
                                    </div>

                                    <span className="shrink-0 text-slate-400">
                                        {isOpen ? (
                                            <FaChevronUp />
                                        ) : (
                                            <FaChevronDown />
                                        )}
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6 sm:pl-19">
                                        <p className="text-sm leading-7 text-slate-600">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredFaqs.length === 0 && (
                        <div className="rounded-2xl bg-white px-5 py-12 text-center shadow-sm">
                            <FaSearch className="mx-auto mb-4 text-3xl text-slate-300" />

                            <h3 className="text-lg font-semibold text-slate-900">
                                No matching questions found
                            </h3>

                            <p className="mt-2 text-sm text-slate-500">
                                Try another search term or select All
                                to view every question.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    setSearch("");
                                    setSelectedCategory("All");
                                    setOpenFaq(1);
                                }}
                                className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                <p className="mt-4 text-sm text-text-secondary">
                    Showing {filteredFaqs.length} of {faqData.length}{" "}
                    questions.
                </p>
            </section>

            {/* Troubleshooting Tips */}
            <section className="mb-10">
                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-text-primary">
                        Troubleshooting
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        A few things to check when something does not
                        work as expected.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                            <FaLightbulb className="text-xl" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            Data is not updating
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Check your form inputs and validation
                            messages. If the application uses a backend,
                            inspect the API response and confirm the
                            database operation succeeded.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
                            <FaBug className="text-xl" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            A page is showing an error
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Open your browser developer tools and check
                            the Console. Also inspect the Network tab
                            for failed API requests, then review your
                            backend terminal for error messages.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <FaUserShield className="text-xl" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            Login or account problems
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Verify your authentication flow, backend
                            configuration, and API response. Never
                            share passwords, secret keys, or database
                            connection strings when reporting an issue.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <FaChartLine className="text-xl" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900">
                            Incorrect totals or charts
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            Confirm that each transaction has the
                            correct type, date, category, and amount.
                            Make sure summaries use the selected date
                            range and actual transaction data.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <FaComments className="text-xl" />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Still need help?
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Describe your issue using the support
                                form. You can connect it to your backend
                                when you are ready to receive support
                                requests.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowContactForm((current) => !current);
                            setFormMessage("");
                        }}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
                    >
                        {showContactForm ? (
                            <>
                                <FaTimes />
                                Close Form
                            </>
                        ) : (
                            <>
                                <FaEnvelope />
                                Contact Support
                            </>
                        )}
                    </button>
                </div>

                {showContactForm && (
                    <form
                        onSubmit={handleContactSubmit}
                        className="mt-7 border-t border-slate-100 pt-7"
                    >
                        {/* Form Status */}
                        {formMessage && (
                            <div
                                role="status"
                                aria-live="polite"
                                className={`mb-5 flex items-start gap-3 rounded-xl p-4 text-sm leading-6 ${
                                    formStatus === "error"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-blue-50 text-blue-700"
                                }`}
                            >
                                <FaInfoCircle className="mt-1 shrink-0" />

                                <p>{formMessage}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="support-name"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Full Name
                                </label>

                                <input
                                    id="support-name"
                                    name="name"
                                    type="text"
                                    value={contactForm.name}
                                    onChange={handleContactChange}
                                    placeholder="Enter your name"
                                    autoComplete="name"
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="support-email"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Email Address
                                </label>

                                <input
                                    id="support-email"
                                    name="email"
                                    type="email"
                                    value={contactForm.email}
                                    onChange={handleContactChange}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="support-topic"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Topic
                                </label>

                                <select
                                    id="support-topic"
                                    name="topic"
                                    value={contactForm.topic}
                                    onChange={handleContactChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                >
                                    <option>General Question</option>
                                    <option>Expenses</option>
                                    <option>Income</option>
                                    <option>Budgets</option>
                                    <option>Analytics</option>
                                    <option>Account & Security</option>
                                    <option>Technical Issue</option>
                                    <option>Feature Request</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="support-subject"
                                    className="mb-2 block text-sm font-medium text-slate-700"
                                >
                                    Subject
                                </label>

                                <input
                                    id="support-subject"
                                    name="subject"
                                    type="text"
                                    value={contactForm.subject}
                                    onChange={handleContactChange}
                                    placeholder="Briefly describe the issue"
                                    required
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        <div className="mt-5">
                            <label
                                htmlFor="support-message"
                                className="mb-2 block text-sm font-medium text-slate-700"
                            >
                                How can we help?
                            </label>

                            <textarea
                                id="support-message"
                                name="message"
                                value={contactForm.message}
                                onChange={handleContactChange}
                                placeholder="Explain the problem and what you were trying to do..."
                                rows={5}
                                required
                                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            Do not include passwords, payment card
                            details, or secret credentials.
                        </p>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={clearContactForm}
                                className="rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                Clear Form
                            </button>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                            >
                                <FaPaperPlane />
                                Submit Request
                            </button>
                        </div>
                    </form>
                )}
            </section>

            {/* Footer */}
            <div className="mt-8 flex flex-col items-center justify-center gap-2 text-center text-sm text-text-secondary">
                <FaQuestionCircle className="text-xl" />

                <p>
                    Expense Tracker Pro · Help Center
                </p>

                <p>
                    Need to change your preferences?{" "}
                    <Link
                        to="/settings"
                        className="font-semibold text-white underline underline-offset-4 hover:opacity-80"
                    >
                        Visit Settings
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Help;