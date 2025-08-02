import React from "react";

export interface WeatherInfo {
  city: string;
  temp: number;
  description: string;
}
export interface CurrencyInfo {
  base: string;
  rates: Record<string, number>;
}
export interface EventInfo {
  id: string;
  name: string;
  url?: string;
}

const UtilityInfo: React.FC<{
  weather?: WeatherInfo;
  currency?: CurrencyInfo;
  events?: EventInfo[];
}> = ({ weather, currency, events }) => (
  <div>
    {weather && (
      <div>
        <h3>Weather in {weather.city}</h3>
        <p>{weather.temp}°C, {weather.description}</p>
      </div>
    )}
    {currency && (
      <div>
        <h3>Currency Rates (Base: {currency.base})</h3>
        <ul>
          {Object.entries(currency.rates).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      </div>
    )}
    {events && events.length > 0 && (
      <div>
        <h3>Events</h3>
        <ul>
          {events.map(ev => (
            <li key={ev.id}><a href={ev.url} target="_blank" rel="noopener noreferrer">{ev.name}</a></li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

export default UtilityInfo;
