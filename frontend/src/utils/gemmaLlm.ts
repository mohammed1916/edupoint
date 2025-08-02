import axios from 'axios';

const GEMMA_API_URL = 'https://api.gemma.ai/recommendations';

export interface Preferences {
    source: string;
    destination: string;
    budget: number;
    touristSpots: string[];
    // add more fields as needed
}

export const getRecommendations = async (preferences: Preferences) => {
    try {
        const response = await axios.post(GEMMA_API_URL, preferences);
        return response.data;
    } catch (error) {
        console.error('Error fetching recommendations from Gemma LLM:', error);
        throw error;
    }
};