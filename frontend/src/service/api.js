import axios from "axios";

const rawUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").trim().replace(/\/+$/, '');
const API_BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach JWT token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("railvista.token") || localStorage.getItem("aerorail.token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Automatically handle 401 unauthorized responses to avoid stale login states
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            // Do not clear tokens on intentional invalid login/register password attempts
            if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
                localStorage.removeItem("railvista.token");
                localStorage.removeItem("railvista.user");
                localStorage.removeItem("aerorail.token");
                localStorage.removeItem("aerorail.user");
                window.dispatchEvent(new Event('auth:unauthorized'));
            }
        }
        return Promise.reject(error);
    }
);

// Stations
export const getStations = async () => {
    const response = await api.get("/stations");
    return response.data;
};

// Search trains between two stations on a specific date
export const searchTrains = async ({ from, to, date }) => {
    const response = await api.get("/trains/search", {
        params: {
            from,
            to,
            date,
        },
    });
    return response.data;
};

// Get single train details
export const getTrain = async (trainId) => {
    const response = await api.get(`/trains/${trainId}`);
    return response.data;
};

// Get train schedule with intermediate stops
export const getTrainSchedule = async (trainId) => {
    const response = await api.get(`/trains/${trainId}/schedule`);
    return response.data;
};

// Get train classes
export const getTrainClasses = async (trainId) => {
    const response = await api.get(`/trains/${trainId}/classes`);
    return response.data;
};

// Get seat availability for a train
export const getAvailability = async ({
    trainId,
    from,
    to,
    date,
}) => {
    const response = await api.get(
        `/trains/${trainId}/availability`,
        {
            params: {
                from,
                to,
                date,
            },
        }
    );
    return response.data;
};

// Bookings
export const createBooking = async (booking) => (await api.post('/bookings', booking)).data;
export const payBooking = async (bookingId, method) => (await api.post(`/bookings/${bookingId}/payment`, { method })).data;
export const getBooking = async (bookingId) => (await api.get(`/bookings/${bookingId}`)).data;
export const getUserBookings = async () => (await api.get('/bookings')).data;
export const cancelBooking = async (bookingId) => (await api.post(`/bookings/${bookingId}/cancel`)).data;

// Auth
export const loginUser = async (credentials) => (await api.post('/auth/login', credentials)).data;
export const registerUser = async (details) => (await api.post('/auth/register', details)).data;
export const getMe = async () => (await api.get('/auth/me')).data;

// Chatbot Assistant
export const sendChatMessage = async ({ message, history }) => (await api.post('/chat', { message, history })).data;
