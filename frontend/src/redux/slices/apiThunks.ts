import { createAsyncThunk } from '@reduxjs/toolkit';
import { setResults, setRecommendations, setTouristSpots, setWeather, setCurrency, setEvents } from './searchSlice';
import { AppDispatch, RootState } from '../store';

// export const fetchHotels = createAsyncThunk(
//   'api/fetchHotels',
//   async (
//     { location, checkin, checkout, guests }: { location: string; checkin: string; checkout: string; guests: number },
//     { dispatch }
//   ) => {
//     // Disabled: No API key
//     // const res = await fetch(`/api/hotels?location=${location}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`);
//     // const data = await res.json();
//     // dispatch(setResults({ hotels: data.result || data.hotels || data, buses: [], trains: [], flights: [] }));
//     // return data;
//     return null;
//   }
// );

// export const fetchFlights = createAsyncThunk(
//   'api/fetchFlights',
//   async (
//     { origin, destination, date }: { origin: string; destination: string; date: string },
//     { dispatch }
//   ) => {
//     // Disabled: No API key
//     // const res = await fetch(`/api/flights?origin=${origin}&destination=${destination}&date=${date}`);
//     // const data = await res.json();
//     // dispatch(setResults({ flights: data.result || data.flights || data, buses: [], trains: [], hotels: [] }));
//     // return data;
//     return null;
//   }
// );

// export const fetchActivities = createAsyncThunk(
//   'api/fetchActivities',
//   async (location: string, { dispatch }) => {
//     // Disabled: No API key
//     // const res = await fetch(`/api/attractions?location=${location}`);
//     // const data = await res.json();
//     // dispatch(setTouristSpots(data.result || data.attractions || data));
//     // return data;
//     return null;
//   }
// );

export const fetchRecommendations = createAsyncThunk(
  'api/fetchRecommendations',
  async (_: void, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { source, destination, budget, touristSpots } = state.search;
    // Compose a prompt with user context
    const prompt = [
      {
        role: 'system',
        content: [
          { type: 'text', text: 'You are a travel assistant. Recommend a personalized travel plan.' }
        ]
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: `My trip is from ${source} to ${destination}. My budget is ${budget}.` },
          { type: 'text', text: `I am interested in these tourist spots: ${touristSpots.map(s => s.name || s).join(', ')}` }
        ]
      }
    ];
    // Use backend base URL from env or default to http://localhost:8000
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const provider = localStorage.getItem('llm_provider') || 'gemini';
    let apiUrl = `${backendUrl}/api/gemini`;
    if (provider === 'ollama') apiUrl = `${backendUrl}/api/ollama`;
    // If you want to disable API calls, uncomment the next line:
    // return null;
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: prompt }),
    });
    const data = await res.json();
    dispatch(setRecommendations([data.result]));
    return data;
  }
);

// export const fetchWeather = createAsyncThunk(
//   'api/fetchWeather',
//   async (city: string, { dispatch }) => {
//     // Disabled: No API key
//     // const res = await fetch(`/api/weather?city=${city}`);
//     // const data = await res.json();
//     // dispatch(setWeather(data));
//     // return data;
//     return null;
//   }
// );

// export const fetchCurrency = createAsyncThunk(
//   'api/fetchCurrency',
//   async ({ base, symbols }: { base: string; symbols: string }, { dispatch }) => {
//     // Disabled: No API key
//     // const res = await fetch(`/api/currency?base=${base}&symbols=${symbols}`);
//     // const data = await res.json();
//     // dispatch(setCurrency(data));
//     // return data;
//     return null;
//   }
// );

// export const fetchEvents = createAsyncThunk(
//   'api/fetchEvents',
//   async (city: string, { dispatch }) => {
//     // Disabled: No API key
//     // const res = await fetch(`/api/events?city=${city}`);
//     // const data = await res.json();
//     // dispatch(setEvents(data.events || data.result || data));
//     // return data;
//     return null;
//   }
// );
