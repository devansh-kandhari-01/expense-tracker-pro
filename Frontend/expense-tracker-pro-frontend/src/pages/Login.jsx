import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {
            setError(
                "Email and password are required."
            );
            return;
        }

        try {
            setLoading(true);

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000";

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Login failed"
                );
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            navigate("/");

        } catch (error) {
            console.error(
                "Login error:",
                error.message
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6">

            <div className="w-full max-w-md rounded-3xl bg-secondary p-8 shadow-xl">

                {/* Header */}

                <div className="text-center">

                    <h1 className="text-3xl font-bold text-text-primary">
                        Welcome Back
                    </h1>

                    <p className="mt-2 text-text-secondary">
                        Login to your Expense Tracker account
                    </p>

                </div>


                {/* Error */}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 flex flex-col gap-5"
                >

                    {/* Email */}

                    <div>

                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-text-primary"
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            autoComplete="email"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />

                    </div>


                    {/* Password */}

                    <div>

                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-text-primary"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />

                    </div>


                    {/* Login Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>


                {/* Register */}

                <p className="mt-6 text-center text-sm text-text-secondary">

                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="font-semibold text-white underline hover:opacity-80"
                    >
                        Sign Up
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Login;