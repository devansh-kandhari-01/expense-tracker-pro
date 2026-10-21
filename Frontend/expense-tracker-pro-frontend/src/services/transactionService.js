const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

const getAuthHeaders = () => {
    const token =
        localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };
};

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