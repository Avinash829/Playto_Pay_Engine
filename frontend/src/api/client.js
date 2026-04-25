import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

const api = axios.create({
    baseURL: baseURL,
});

export const getBalance = (merchantId) =>
    api.get(`/merchants/${merchantId}/balance/`);
export const getPayouts = (merchantId) =>
    api.get(`/merchants/${merchantId}/payouts/`);
export const getTransactions = (merchantId) =>
    api.get(`/merchants/${merchantId}/transactions/`);

export const createPayout = (merchantId, data, idempotencyKey) =>
    api.post(`/merchants/${merchantId}/payouts/`, data, {
        headers: {
            "Idempotency-Key": idempotencyKey,
        },
    });

export default api;
