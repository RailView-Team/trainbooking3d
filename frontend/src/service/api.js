import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

// Get all stations
export const getStations = async () => {
    const response = await api.get("/stations");
    return response.data;
};

// Search trains between two stations
export const searchTrains = async ({ from, to }) => {
    const response = await api.get("/trains/search", {
        params: {
            from,
            to,
        },
    });

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