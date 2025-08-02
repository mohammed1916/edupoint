import React from "react";

export interface Hotel {
  id: string;
  name: string;
  address: string;
  price?: string;
  rating?: number;
}

const HotelResults: React.FC<{ hotels: Hotel[] }> = ({ hotels }) => (
  <div>
        <h2>Hotels</h2>
    {hotels && hotels.length > 0 ? (
      <div>
        <ul>
          {hotels.map(hotel => (
            <li key={hotel.id}>
              <strong>{hotel.name}</strong> <br />
              {hotel.address} <br />
              {hotel.price && <span>Price: {hotel.price}</span>} <br />
              {hotel.rating && <span>Rating: {hotel.rating}</span>}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p>No hotels available.</p>
    )}
  </div>
);

export default HotelResults;
