import axios from 'axios';

const BASE_URL = 'https://api.example.com'; // Replace with actual transport API base URL

export const fetchBuses = async (source: string, destination: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/buses`, {
            params: { source, destination }
        });
        return response.data;
    } catch (error: any) {
        throw new Error('Error fetching bus data: ' + error.message);
    }
};

export const fetchTrains = async (source: string, destination: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/trains`, {
            params: { source, destination }
        });
        return response.data;
    } catch (error: any) {
        throw new Error('Error fetching train data: ' + error.message);
    }
};

export const fetchFlights = async (source: string, destination: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/flights`, {
            params: { source, destination }
        });
        return response.data;
    } catch (error: any) {
        throw new Error('Error fetching flight data: ' + error.message);
    }
};