import React, { useEffect, useState } from "react";
// @ts-ignore
import { GoogleMap, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: 8,
  margin: '1rem 0',
};

const libraries: Array<'places' | 'geometry' | 'drawing' | 'visualization'> = ['places'];

const MapDisplay: React.FC<{ source?: string; destination?: string }> = ({ source, destination }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });
  const [directions, setDirections] = useState<any>(null);

  useEffect(() => {
    if (isLoaded && source && destination) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: source,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result: any, status: string) => {
          if (status === 'OK') setDirections(result);
        }
      );
    }
  }, [isLoaded, source, destination]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={{ lat: 20.5937, lng: 78.9629 }} // Center on India by default
      zoom={5}
    >
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  ) : (
    <div style={containerStyle} />
  );
};

export default MapDisplay;
