import axios from 'axios';

const API_BASE_URL = 'https://api.example.com/tourist'; // Replace with actual tourist API base URL

export const fetchTouristSpots = async (source: string, destination: string, budget: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/spots`, {
            params: {
                source,
                destination,
                budget
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching tourist spots:', error);
        throw error;
    }
};

export const fetchActivities = async (destination: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/activities`, {
            params: {
                destination
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching activities:', error);
        throw error;
    }
};