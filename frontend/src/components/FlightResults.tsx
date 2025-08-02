import React from "react";

export interface Flight {
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  price?: string;
}

const FlightResults: React.FC<{ flights: Flight[] }> = ({ flights }) => (
  <div>
    <h2>Flights</h2>
    {flights && flights.length > 0 ? (
      <div>
        <ul>
          {flights.map(flight => (
            <li key={flight.id}>
              <strong>{flight.airline}</strong> <br />
              {flight.departure} → {flight.arrival} <br />
              {flight.price && <span>Price: {flight.price}</span>}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p>No flights available.</p>
    )}
  </div>
);

export default FlightResults;
