import axios from 'axios';

const API_URL = 'https://api.example.com/hotels'; // Replace with actual hotel API URL

export const fetchHotels = async (source: string, destination: string, checkIn: string, checkOut: string, budget: number) => {
    try {
        const response = await axios.get(API_URL, {
            params: {
                source,
                destination,
                checkIn,
                checkOut,
                budget
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching hotels:', error);
        throw error;
    }
};