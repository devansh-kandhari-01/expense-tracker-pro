import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaTimes } from "react-icons/fa";

function Logout() {
    const navigate = useNavigate();

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    const handleLogout = () => {
        setIsLoggingOut(true);

        // Remove authentication data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Go to login page
        navigate("/login");
    };

    const handleCancel = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6">

            <div className="w-full max-w-md rounded-3xl bg-secondary p-8 text-center shadow-xl">

                {/* Icon */}

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                    <FaSignOutAlt className="text-3xl text-red-500" />
                </div>


                {/* Heading */}

                <h1 className="mt-6 text-2xl font-bold text-text-primary">
                    Logout
                </h1>


                {/* Description */}

                <p className="mt-3 text-text-secondary">
                    Are you sure you want to logout from your Expense Tracker
                    account?
                </p>


                {/* Buttons */}

                <div className="mt-8 flex gap-4">

                    {/* Cancel */}

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoggingOut}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-medium text-text-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        <FaTimes />

                        Cancel
                    </button>


                    {/* Logout */}

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        <FaSignOutAlt />

                        {isLoggingOut
                            ? "Logging out..."
                            : "Logout"}
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Logout;