const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};


// =====================================================
// CREATE TRANSACTION
// =====================================================

export const createTransaction = async (
    transactionData
) => {
    const response = await fetch(
        `${API_URL}/api/transactions`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(transactionData),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to create transaction"
        );
    }

    return data;
};


// =====================================================
// GET ALL TRANSACTIONS
// =====================================================

export const getTransactions = async () => {
    const response = await fetch(
        `${API_URL}/api/transactions`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to fetch transactions"
        );
    }

    return data;
};


// =====================================================
// GET TRANSACTION BY ID
// =====================================================

export const getTransactionById = async (
    id
) => {
    const response = await fetch(
        `${API_URL}/api/transactions/${id}`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to fetch transaction"
        );
    }

    return data;
};


// =====================================================
// UPDATE TRANSACTION
// =====================================================

export const updateTransaction = async (
    id,
    transactionData
) => {
    const response = await fetch(
        `${API_URL}/api/transactions/${id}`,
        {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(
                transactionData
            ),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to update transaction"
        );
    }

    return data;
};


// =====================================================
// DELETE TRANSACTION
// =====================================================

export const deleteTransaction = async (
    id
) => {
    const response = await fetch(
        `${API_URL}/api/transactions/${id}`,
        {
            method: "DELETE",
            headers: getAuthHeaders(),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to delete transaction"
        );
    }

    return data;
};