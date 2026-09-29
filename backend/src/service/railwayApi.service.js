import axios from 'axios';

/**
 * Service for fetching live Indian Railways & IRCTC data from external API
 * Configured via environment variables:
 * - RAILWAY_API_KEY (e.g., RapidAPI key or custom IRCTC API key)
 * - RAILWAY_API_HOST (e.g., irctc1.p.rapidapi.com or indian-railways-api)
 */

export const isExternalApiConfigured = () => {
    return Boolean(process.env.RAILWAY_API_KEY);
};

const getApiClient = () => {
    const apiKey = process.env.RAILWAY_API_KEY;
    const apiHost = process.env.RAILWAY_API_HOST || 'irctc1.p.rapidapi.com';

    return axios.create({
        baseURL: `https://${apiHost}/api/v3`,
        timeout: 10000,
        headers: {
            'x-rapidapi-key': apiKey,
            'x-rapidapi-host': apiHost,
            'Content-Type': 'application/json',
        },
    });
};

/**
 * Fetch live PNR Status from external API
 * @param {string} pnr 10-digit PNR number
 */
export const getLivePNRStatus = async (pnr) => {
    if (!isExternalApiConfigured()) return null;

    try {
        const client = getApiClient();
        const response = await client.get(`/getPNRStatus`, {
            params: { pnrNumber: pnr },
        });

        if (response.data && response.data.status) {
            return {
                pnr: response.data.data?.pnr || pnr,
                trainNumber: response.data.data?.trainNumber,
                trainName: response.data.data?.trainName,
                from: response.data.data?.sourceStation,
                to: response.data.data?.destinationStation,
                date: response.data.data?.dateOfJourney,
                chartPrepared: response.data.data?.chartPrepared,
                passengers: response.data.data?.passengerList || [],
            };
        }
        return null;
    } catch (error) {
        console.warn(`[Railway API] Live PNR lookup failed for PNR ${pnr}:`, error.message);
        return null;
    }
};

/**
 * Fetch live trains between stations from external API
 * @param {string} fromCode Station code (e.g. HWH)
 * @param {string} toCode Station code (e.g. NDLS)
 * @param {string} date Date in YYYY-MM-DD
 */
export const getLiveTrainsBetweenStations = async (fromCode, toCode, date) => {
    if (!isExternalApiConfigured()) return null;

    try {
        const client = getApiClient();
        const response = await client.get(`/trainBetweenStations`, {
            params: {
                fromStationCode: fromCode,
                toStationCode: toCode,
                dateOfJourney: date,
            },
        });

        if (response.data && response.data.data) {
            return response.data.data.map(train => ({
                trainId: train.train_number,
                trainNumber: train.train_number,
                name: train.train_name,
                trainType: train.train_type || 'SUPERFAST',
                from: { code: fromCode, name: train.from_station_name || fromCode },
                to: { code: toCode, name: train.to_station_name || toCode },
                departure: train.departure_time || train.from_std,
                arrival: train.arrival_time || train.to_sta,
                durationMinutes: Number(train.duration) || 0,
                status: 'ON TIME',
            }));
        }
        return null;
    } catch (error) {
        console.warn(`[Railway API] Live train search failed (${fromCode}->${toCode}):`, error.message);
        return null;
    }
};
