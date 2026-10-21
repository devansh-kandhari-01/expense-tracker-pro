import { NavLink } from "react-router-dom";

import {
    FaHome,
    FaReceipt,
    FaWallet,
    FaChartPie,
    FaPiggyBank,
    FaCog,
    FaQuestionCircle,
    FaSignOutAlt,
    FaSignInAlt,
    FaUserPlus,
} from "react-icons/fa";

function NavBar() {

    const token = localStorage.getItem("token");

    const isLoggedIn = Boolean(token);

    return (
        <aside className="w-62.5 shrink-0 bg-secondary p-5 shadow-lg">

            {/* ========================= */}
            {/* LOGO */}
            {/* ========================= */}

            <div className="mb-8">

                <h1 className="text-2xl font-bold text-text-primary">
                    Expense Tracker
                </h1>

                <p className="mt-1 text-sm text-text-secondary">
                    Manage your money
                </p>

            </div>


            {/* ========================= */}
            {/* LOGGED IN SIDEBAR */}
            {/* ========================= */}

            {isLoggedIn ? (

                <nav className="flex flex-col gap-2">

                    {/* Dashboard */}

                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaHome />

                        <span>
                            Dashboard
                        </span>
                    </NavLink>


                    {/* Expenses */}

                    <NavLink
                        to="/expenses"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaReceipt />

                        <span>
                            Expenses
                        </span>
                    </NavLink>


                    {/* Income */}

                    <NavLink
                        to="/income"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaWallet />

                        <span>
                            Income
                        </span>
                    </NavLink>


                    {/* Analytics */}

                    <NavLink
                        to="/analytics"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaChartPie />

                        <span>
                            Analytics
                        </span>
                    </NavLink>


                    {/* Budgets */}

                    <NavLink
                        to="/budgets"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaPiggyBank />

                        <span>
                            Budgets
                        </span>
                    </NavLink>


                    {/* Settings */}

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaCog />

                        <span>
                            Settings
                        </span>
                    </NavLink>


                    {/* Help */}

                    <NavLink
                        to="/help"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaQuestionCircle />

                        <span>
                            Help & Support
                        </span>
                    </NavLink>


                    {/* Logout */}

                    <div className="my-3 border-t border-white/20" />

                    <NavLink
                        to="/logout"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-red-500 text-white"
                                    : "text-text-primary hover:bg-red-500 hover:text-white"
                            }`
                        }
                    >
                        <FaSignOutAlt />

                        <span>
                            Logout
                        </span>
                    </NavLink>

                </nav>

            ) : (

                /* ========================= */
                /* LOGGED OUT SIDEBAR */
                /* ========================= */

                <nav className="flex flex-col gap-2">

                    {/* Login */}

                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaSignInAlt />

                        <span>
                            Login
                        </span>
                    </NavLink>


                    {/* Register */}

                    <NavLink
                        to="/register"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-primary hover:bg-primary hover:text-white"
                            }`
                        }
                    >
                        <FaUserPlus />

                        <span>
                            Sign Up
                        </span>
                    </NavLink>

                </nav>

            )}

        </aside>
    );
}

export default NavBar;