import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
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
