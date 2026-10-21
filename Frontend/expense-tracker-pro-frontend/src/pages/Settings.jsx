import { useState } from "react";
import {
    FaUser,
    FaSlidersH,
    FaBell,
    FaSave,
    FaDownload,
    FaRedo,
    FaCheckCircle,
    FaInfoCircle,
    FaGlobe,
    FaRupeeSign,
    FaPalette,
    FaShieldAlt,
} from "react-icons/fa";

// Default profile information
const defaultProfile = {
    fullName: "John Doe",
    email: "john@example.com",
    phone: "",
};

// Default application preferences
const defaultPreferences = {
    currency: "INR",
    dateFormat: "DD/MM/YYYY",
    language: "English",
    theme: "Light",
};

// Default notification preferences
const defaultNotifications = {
    emailNotifications: true,
    budgetAlerts: true,
    weeklySummary: false,
    unusualSpending: true,
};

// Safely load saved settings from localStorage
const loadSetting = (key, defaults) => {
    try {
        const saved = localStorage.getItem(key);

        if (saved) {
            return {
                ...defaults,
                ...JSON.parse(saved),
            };
        }
    } catch {
        // Fall back to default settings if saved data is invalid.
    }

    return { ...defaults };
};

// Reusable section card
function SettingsSection({ icon: Icon, title, description, children }) {
    return (
        <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Icon className="text-xl" />
                </div>

                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </section>
    );
}

// Reusable input field
function FormField({
    label,
    name,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
        </div>
    );
}

// Reusable select field
function SelectField({
    label,
    name,
    value,
    onChange,
    options,
}) {
    return (
        <div>
            <label
                htmlFor={name}
                className="mb-2 block text-sm font-medium text-slate-700"
            >
                {label}
            </label>

            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

// Reusable notification toggle
function ToggleRow({
    title,
    description,
    checked,
    onChange,
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-b-0">
            <div>
                <h3 className="font-medium text-slate-800">
                    {title}
                </h3>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                    {description}
                </p>
            </div>

            <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    className="peer sr-only"
                />

                <span className="h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-indigo-600  peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-indigo-600 after:absolute after:left-0.75 after:top-0.75 after:h-4.5 after:w-4.5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
            </label>
        </div>
    );
}

// Reusable save button
function SaveButton({ children = "Save Changes" }) {
    return (
        <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
        >
            <FaSave />
            {children}
        </button>
    );
}

function Settings() {
    // Profile state
    const [profile, setProfile] = useState(() =>
        loadSetting("expenseTrackerProfile", defaultProfile)
    );

    // Preferences state
    const [preferences, setPreferences] = useState(() =>
        loadSetting("expenseTrackerPreferences", defaultPreferences)
    );

    // Notifications state
    const [notifications, setNotifications] = useState(() =>
        loadSetting(
            "expenseTrackerNotifications",
            defaultNotifications
        )
    );

    // Password form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Message displayed after an action
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    // Display a status message
    const showMessage = (text, type = "success") => {
        setMessage(text);
        setMessageType(type);
    };

    // Save a settings section to localStorage
    const saveToStorage = (key, data, sectionName) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            showMessage(`${sectionName} saved successfully.`);
        } catch {
            showMessage(
                "Unable to save settings in this browser.",
                "error"
            );
        }
    };

    // Handle profile input changes
    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // Handle preference changes
    const handlePreferenceChange = (event) => {
        const { name, value } = event.target;

        setPreferences((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // Handle notification switches
    const handleNotificationChange = (name, checked) => {
        setNotifications((current) => ({
            ...current,
            [name]: checked,
        }));
    };

    // Save profile
    const handleProfileSubmit = (event) => {
        event.preventDefault();

        saveToStorage(
            "expenseTrackerProfile",
            profile,
            "Profile settings"
        );
    };

    // Save preferences
    const handlePreferencesSubmit = (event) => {
        event.preventDefault();

        saveToStorage(
            "expenseTrackerPreferences",
            preferences,
            "Application preferences"
        );
    };

    // Save notifications
    const handleNotificationsSubmit = (event) => {
        event.preventDefault();

        saveToStorage(
            "expenseTrackerNotifications",
            notifications,
            "Notification settings"
        );
    };

    // Handle password input changes
    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // Validate password form
    const handlePasswordSubmit = (event) => {
        event.preventDefault();

        if (
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {
            showMessage(
                "Please fill in all password fields.",
                "error"
            );
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showMessage(
                "Your new password must contain at least 8 characters.",
                "error"
            );
            return;
        }

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            showMessage(
                "The new password and confirmation do not match.",
                "error"
            );
            return;
        }

        // No password is stored in localStorage.
        // A backend password-change API is required to update it.
        showMessage(
            "Validation passed. Connect your backend password-change API to update your password.",
            "info"
        );

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    // Reset application preferences
    const handleResetPreferences = () => {
        const confirmed = window.confirm(
            "Reset your application preferences to their defaults?"
        );

        if (!confirmed) return;

        try {
            localStorage.removeItem("expenseTrackerPreferences");
        } catch {
            showMessage(
                "Unable to reset preferences in this browser.",
                "error"
            );
            return;
        }

        setPreferences({ ...defaultPreferences });

        showMessage("Application preferences have been reset.");
    };

    // Export the settings currently stored in this component
    const handleExportSettings = () => {
        const exportData = {
            profile,
            preferences,
            notifications,
            exportedAt: new Date().toISOString(),
        };

        try {
            const file = new Blob(
                [JSON.stringify(exportData, null, 2)],
                { type: "application/json" }
            );

            const downloadUrl = URL.createObjectURL(file);
            const link = document.createElement("a");

            link.href = downloadUrl;
            link.download = "expense-tracker-settings.json";

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(downloadUrl);

            showMessage("Settings export downloaded.");
        } catch {
            showMessage(
                "Unable to export settings.",
                "error"
            );
        }
    };

    return (
        <div className="min-h-screen bg-primary px-4 py-8 sm:px-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
                    Settings
                </h1>

                <p className="mt-2 text-text-secondary">
                    Manage your profile, preferences, notifications,
                    and account security.
                </p>
            </div>

            {/* Status Message */}
            {message && (
                <div
                    role="status"
                    aria-live="polite"
                    className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
                        messageType === "error"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : messageType === "info"
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-green-200 bg-green-50 text-green-700"
                    }`}
                >
                    {messageType === "error" ? (
                        <FaInfoCircle className="mt-1 shrink-0" />
                    ) : (
                        <FaCheckCircle className="mt-1 shrink-0" />
                    )}

                    <p className="text-sm font-medium">{message}</p>

                    <button
                        type="button"
                        onClick={() => setMessage("")}
                        aria-label="Dismiss message"
                        className="ml-auto font-bold cursor-pointer"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="flex flex-col gap-7">
                {/* Profile Settings */}
                <SettingsSection
                    icon={FaUser}
                    title="Profile Information"
                    description="Update the personal information associated with your account."
                >
                    <div className="mb-7 flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
                            {profile.fullName
                                .trim()
                                .charAt(0)
                                .toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0">
                            <h3 className="truncate font-semibold text-slate-900">
                                {profile.fullName || "Your Name"}
                            </h3>

                            <p className="mt-1 truncate text-sm text-slate-500">
                                {profile.email || "Your Email"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Expense Tracker Pro account
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleProfileSubmit}
                        className="flex flex-col gap-5"
                    >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                label="Full Name"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleProfileChange}
                                placeholder="Enter your full name"
                                required
                            />

                            <FormField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleProfileChange}
                                placeholder="Enter your email"
                                required
                            />

                            <FormField
                                label="Phone Number"
                                name="phone"
                                type="tel"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                placeholder="Enter your phone number"
                            />
                        </div>

                        <div className="flex justify-end">
                            <SaveButton>Save Profile</SaveButton>
                        </div>
                    </form>
                </SettingsSection>

                {/* Application Preferences */}
                <SettingsSection
                    icon={FaSlidersH}
                    title="Application Preferences"
                    description="Customize how dates, currencies, and the application appearance are displayed."
                >
                    <form
                        onSubmit={handlePreferencesSubmit}
                        className="flex flex-col gap-5"
                    >
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <SelectField
                                label="Currency"
                                name="currency"
                                value={preferences.currency}
                                onChange={handlePreferenceChange}
                                options={[
                                    {
                                        value: "INR",
                                        label: "INR - Indian Rupee (₹)",
                                    },
                                    {
                                        value: "USD",
                                        label: "USD - US Dollar ($)",
                                    },
                                    {
                                        value: "EUR",
                                        label: "EUR - Euro (€)",
                                    },
                                    {
                                        value: "GBP",
                                        label: "GBP - British Pound (£)",
                                    },
                                ]}
                            />

                            <SelectField
                                label="Date Format"
                                name="dateFormat"
                                value={preferences.dateFormat}
                                onChange={handlePreferenceChange}
                                options={[
                                    {
                                        value: "DD/MM/YYYY",
                                        label: "DD/MM/YYYY",
                                    },
                                    {
                                        value: "MM/DD/YYYY",
                                        label: "MM/DD/YYYY",
                                    },
                                    {
                                        value: "YYYY-MM-DD",
                                        label: "YYYY-MM-DD",
                                    },
                                ]}
                            />

                            <SelectField
                                label="Language"
                                name="language"
                                value={preferences.language}
                                onChange={handlePreferenceChange}
                                options={[
                                    {
                                        value: "English",
                                        label: "English",
                                    },
                                    {
                                        value: "Hindi",
                                        label: "Hindi",
                                    },
                                ]}
                            />

                            <SelectField
                                label="Appearance"
                                name="theme"
                                value={preferences.theme}
                                onChange={handlePreferenceChange}
                                options={[
                                    {
                                        value: "Light",
                                        label: "Light Mode",
                                    },
                                    {
                                        value: "Dark",
                                        label: "Dark Mode",
                                    },
                                    {
                                        value: "System",
                                        label: "Use System Setting",
                                    },
                                ]}
                            />
                        </div>

                        <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="flex items-center gap-3">
                                <FaRupeeSign className="text-indigo-600" />
                                <span>
                                    Currency selection is saved as a
                                    preference. Connect it to your money
                                    formatting functions to update
                                    displayed amounts.
                                </span>
                            </p>

                            <p className="flex items-center gap-3">
                                <FaPalette className="text-indigo-600" />
                                <span>
                                    Appearance and language preferences
                                    are saved, but need app-wide
                                    integration to change the interface.
                                </span>
                            </p>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                onClick={handleResetPreferences}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                            >
                                <FaRedo />
                                Reset Preferences
                            </button>

                            <SaveButton>Save Preferences</SaveButton>
                        </div>
                    </form>
                </SettingsSection>

                {/* Notification Settings */}
                <SettingsSection
                    icon={FaBell}
                    title="Notifications"
                    description="Choose which alerts and reminders you want to receive."
                >
                    <form
                        onSubmit={handleNotificationsSubmit}
                        className="flex flex-col"
                    >
                        <ToggleRow
                            title="Email Notifications"
                            description="Receive account updates and important notifications by email."
                            checked={notifications.emailNotifications}
                            onChange={(checked) =>
                                handleNotificationChange(
                                    "emailNotifications",
                                    checked
                                )
                            }
                        />

                        <ToggleRow
                            title="Budget Alerts"
                            description="Get notified when your spending approaches or exceeds a budget."
                            checked={notifications.budgetAlerts}
                            onChange={(checked) =>
                                handleNotificationChange(
                                    "budgetAlerts",
                                    checked
                                )
                            }
                        />

                        <ToggleRow
                            title="Weekly Summary"
                            description="Receive a summary of your weekly income and expenses."
                            checked={notifications.weeklySummary}
                            onChange={(checked) =>
                                handleNotificationChange(
                                    "weeklySummary",
                                    checked
                                )
                            }
                        />

                        <ToggleRow
                            title="Unusual Spending Alerts"
                            description="Get alerted to unusual spending activity."
                            checked={notifications.unusualSpending}
                            onChange={(checked) =>
                                handleNotificationChange(
                                    "unusualSpending",
                                    checked
                                )
                            }
                        />

                        <div className="mt-5 flex justify-end">
                            <SaveButton>Save Notifications</SaveButton>
                        </div>
                    </form>
                </SettingsSection>

                {/* Security Settings */}
                <SettingsSection
                    icon={FaShieldAlt}
                    title="Password & Security"
                    description="Keep your account secure by using a strong password."
                >
                    <form
                        onSubmit={handlePasswordSubmit}
                        className="flex flex-col gap-5"
                    >
                        <FormField
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter current password"
                            required
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <FormField
                                label="New Password"
                                name="newPassword"
                                type="password"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="At least 8 characters"
                                required
                            />

                            <FormField
                                label="Confirm New Password"
                                name="confirmPassword"
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Re-enter new password"
                                required
                            />
                        </div>

                        <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                            <FaInfoCircle className="mt-0.5 shrink-0" />

                            <p className="leading-6">
                                This form currently validates the input
                                only. Your password will not be changed
                                until you connect it to a secure backend
                                endpoint.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <SaveButton>Validate Password Form</SaveButton>
                        </div>
                    </form>
                </SettingsSection>

                {/* Data & Privacy */}
                <SettingsSection
                    icon={FaDownload}
                    title="Data & Privacy"
                    description="Export a copy of your current profile and application preferences."
                >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700">
                                <FaGlobe className="text-lg" />
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Export Settings
                                </h3>

                                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                                    Download your profile information,
                                    preferences, and notification
                                    settings as a JSON file.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleExportSettings}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                        >
                            <FaDownload />
                            Export Settings
                        </button>
                    </div>
                </SettingsSection>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-text-secondary">
                Expense Tracker Pro · Account Settings
            </p>
        </div>
    );
}

export default Settings;