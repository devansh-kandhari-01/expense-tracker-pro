import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

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
        setSuccess("");

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            setError("All fields are required.");
            return;
        }

        if (formData.password.length < 6) {
            setError(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);

            const API_URL =
                import.meta.env.VITE_API_URL ||
                "http://localhost:5000";

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Registration failed"
                );
            }

            setSuccess(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.error(
                "Register error:",
                error.message
            );

            setError(error.message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary flex items-center justify-center px-6 py-8">

            <div className="w-full max-w-md rounded-3xl bg-secondary p-8 shadow-xl">

                {/* Header */}

                <div className="text-center">

                    <h1 className="text-3xl font-bold text-text-primary">
                        Create Account
                    </h1>

                    <p className="mt-2 text-text-secondary">
                        Create your Expense Tracker account
                    </p>

                </div>


                {/* Error */}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}


                {/* Success */}

                {success && (
                    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                        {success}
                    </div>
                )}


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8 flex flex-col gap-5"
                >

                    {/* Name */}

                    <div>

                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-text-primary"
                        >
                            Name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            autoComplete="name"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />

                    </div>


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
                            placeholder="Create a password"
                            autoComplete="new-password"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />

                    </div>


                    {/* Confirm Password */}

                    <div>

                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-text-primary"
                        >
                            Confirm Password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
                        />

                    </div>


                    {/* Sign Up Button */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                        {loading
                            ? "Creating account..."
                            : "Sign Up"}
                    </button>

                </form>


                {/* Login */}

                <p className="mt-6 text-center text-sm text-text-secondary">

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="font-semibold text-white underline hover:opacity-80"
                    >
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Register;