import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ResultsType {
    buses: any[];
    trains: any[];
    flights: any[];
    hotels: any[];
}

interface SearchState {
    source: string;
    destination: string;
    results: ResultsType;
    budget: number;
    touristSpots: any[];
    recommendations: any[];
    weather?: any;
    currency?: any;
    events?: any[];
}

const initialState: SearchState = {
    source: '',
    destination: '',
    results: { buses: [], trains: [], flights: [], hotels: [] },
    budget: 0,
    touristSpots: [],
    recommendations: [],
    weather: undefined,
    currency: undefined,
    events: undefined,
};

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {
        setSource(state, action: PayloadAction<string>) {
            state.source = action.payload;
        },
        setDestination(state, action: PayloadAction<string>) {
            state.destination = action.payload;
        },
        setResults(state, action: PayloadAction<ResultsType>) {
            state.results = action.payload;
        },
        setBudget(state, action: PayloadAction<number>) {
            state.budget = action.payload;
        },
        setTouristSpots(state, action: PayloadAction<any[]>) {
            state.touristSpots = action.payload;
        },
        setRecommendations(state, action: PayloadAction<any[]>) {
            state.recommendations = action.payload;
        },
        setWeather(state, action: PayloadAction<any>) {
            state.weather = action.payload;
        },
        setCurrency(state, action: PayloadAction<any>) {
            state.currency = action.payload;
        },
        setEvents(state, action: PayloadAction<any[]>) {
            state.events = action.payload;
        },
        setSearchParams(state, action: PayloadAction<{ source: string; destination: string }>) {
            state.source = action.payload.source;
            state.destination = action.payload.destination;
        },
        clearSearch(state) {
            state.source = '';
            state.destination = '';
            state.results = { buses: [], trains: [], flights: [], hotels: [] };
            state.budget = 0;
            state.touristSpots = [];
            state.recommendations = [];
        },
    },
});

export const {
    setSource,
    setDestination,
    setResults,
    setBudget,
    setTouristSpots,
    setRecommendations,
    setWeather,
    setCurrency,
    setEvents,
    setSearchParams,
    clearSearch,
} = searchSlice.actions;

export default searchSlice.reducer;