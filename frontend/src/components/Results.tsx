import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface Bus {
    details: string;
    // add other fields if needed
}
interface Train {
    details: string;
    // add other fields if needed
}
interface Flight {
    details: string;
    // add other fields if needed
}
interface Hotel {
    details: string;
    // add other fields if needed
}

interface ResultsType {
    buses: Bus[];
    trains: Train[];
    flights: Flight[];
    hotels: Hotel[];
}

const Results: React.FC = () => {
    const results = useSelector((state: RootState) => state.search.results) as ResultsType;
    
    if (!results || Object.keys(results).length === 0) {
        return <div>No results found. Please try a different search.</div>;
    }

    return (
        <div>
            <h2>Search Results</h2>
            <div>
                <h3>Buses</h3>
                {results.buses.map((bus: Bus, index) => (
                    <div key={index}>
                        <p>{bus.details}</p>
                    </div>
                ))}
            </div>
            <div>
                <h3>Trains</h3>
                {results.trains.map((train: Train, index) => (
                    <div key={index}>
                        <p>{train.details}</p>
                    </div>
                ))}
            </div>
            <div>
                <h3>Flights</h3>
                {results.flights.map((flight: Flight, index) => (
                    <div key={index}>
                        <p>{flight.details}</p>
                    </div>
                ))}
            </div>
            <div>
                <h3>Hotels</h3>
                {results.hotels.map((hotel: Hotel, index) => (
                    <div key={index}>
                        <p>{hotel.details}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Results;