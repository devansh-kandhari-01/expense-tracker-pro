const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

// Get all budgets
export const getBudgets = async () => {
    const response = await fetch(
        `${API_URL}/api/budgets`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to fetch budgets"
        );
    }

    return data;
};

// Create budget
export const createBudget = async (budgetData) => {
    const response = await fetch(
        `${API_URL}/api/budgets`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(budgetData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to create budget"
        );
    }

    return data;
};

// Update budget
export const updateBudget = async (id, budgetData) => {
    const response = await fetch(
        `${API_URL}/api/budgets/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(budgetData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to update budget"
        );
    }

    return data;
};

// Delete budget
export const deleteBudget = async (id) => {
    const response = await fetch(
        `${API_URL}/api/budgets/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to delete budget"
        );
    }

    return data;
};