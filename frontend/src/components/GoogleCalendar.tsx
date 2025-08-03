import React, { useState } from 'react';
import GoogleSignIn from './GoogleSignIn';

const GoogleCalendar = () => {
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async (accessToken: string) => {
    try {
      const res = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = await res.json();
      setEvents(data.items || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const handleSignIn = (idToken: string) => {
    setToken(idToken);
    // You need to exchange the ID token for an access token on your backend
    // For demo, just show signed-in state
    // fetchEvents(accessToken); // Uncomment when you have access token
  };

  return (
    <div style={{marginTop: '2rem'}}>
      <h2>Google Calendar Integration</h2>
      {!token ? (
        <GoogleSignIn onSignIn={handleSignIn} />
      ) : (
        <div>
          <p>Signed in! (You need to exchange ID token for access token to fetch events)</p>
          {/* <button onClick={() => fetchEvents(token)}>Fetch Events</button> */}
          <ul>
            {events.map((event) => (
              <li key={event.id}>{event.summary}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendar;
