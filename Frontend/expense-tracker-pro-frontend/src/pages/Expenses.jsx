import { useFormik } from "formik";
import { z } from "zod";
import { createTransaction } from "../services/transactionService";

function Expenses() {
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

  const paymentMethods = [
    "Cash",
    "UPI",
    "Credit Card",
    "Debit Card",
    "Bank Transfer",
    "Other",
  ];

  const expenseSchema = z.object({
    amount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be a positive number"),

    category: z.string().min(1, "Please select a category"),

    description: z.string().min(3, "Description must be at least 3 characters"),

    date: z.string().min(1, "Date is required"),

    paymentMethod: z.string().min(1, "Please select a payment method"),

    notes: z.string().optional(),
  });

  const formik = useFormik({
    initialValues: {
      amount: "",
      category: "",
      description: "",
      date: "",
      paymentMethod: "",
      notes: "",
    },

    validate: (values) => {
      const result = expenseSchema.safeParse(values);

      if (result.success) {
        return {};
      }

      const errors = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        errors[field] = issue.message;
      });

      return errors;
    },

    onSubmit: async (values, { resetForm }) => {
      try {
        const expenseData = {
          ...values,
          type: "expense",
          amount: Number(values.amount),
        };

        const data = await createTransaction(expenseData);

        console.log("Expense created:", data);

        resetForm();
      } catch (error) {
        console.error("Create expense error:", error.message);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
  };

  return (
    <div className="min-h-screen bg-primary px-6 py-8">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Add Expense
            </h1>

            <p className="mt-2 text-text-secondary">
              Record a new expense and keep track of your spending.
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-secondary p-6 shadow-sm">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>

                <input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="0.00"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-xl border border-primary bg-white py-3 pl-9 pr-4 text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              {formik.touched.amount && formik.errors.amount && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.amount}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Category
              </label>

              <select
                id="category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-xl border border-primary bg-white px-4 py-3 text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              >
                <option value="">Select a category</option>

                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              {formik.touched.category && formik.errors.category && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.category}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Description
              </label>

              <input
                id="description"
                name="description"
                type="text"
                placeholder="e.g. Dinner with friends"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-xl border border-primary bg-white px-4 py-3 text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />

              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Date + Payment Method */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Date
                </label>

                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-xl border border-primary bg-white px-4 py-3 text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />

                {formik.touched.date && formik.errors.date && (
                  <p className="mt-1 text-sm text-red-500">
                    {formik.errors.date}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Payment Method
                </label>

                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formik.values.paymentMethod}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-xl border border-primary bg-white px-4 py-3 text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                >
                  <option value="">Select method</option>

                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>

                {formik.touched.paymentMethod &&
                  formik.errors.paymentMethod && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.paymentMethod}
                    </p>
                  )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                rows="4"
                placeholder="Add any additional notes..."
                value={formik.values.notes}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full resize-none rounded-xl border border-primary bg-white px-4 py-3 text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl bg-white px-5 py-3 font-medium text-text-primary hover:opacity-90 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-primary px-6 py-3 font-medium text-white hover:opacity-90 cursor-pointer"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Expenses;
