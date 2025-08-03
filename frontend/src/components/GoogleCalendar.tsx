import React, { useState } from 'react';
import GoogleSignIn from './GoogleSignIn';
import { jwtDecode } from "jwt-decode";

const GoogleCalendar = () => {
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name?: string; picture?: string } | null>(null);

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
    try {
      const decoded: any = jwtDecode(idToken);
      setProfile({ name: decoded.name, picture: decoded.picture });
    } catch (e) {
      setProfile(null);
    }
    // You need to exchange the ID token for an access token on your backend
    // For demo, just show signed-in state
    // fetchEvents(accessToken); // Uncomment when you have access token
  };

  return (
    <div style={{marginTop: '2rem'}}>
      <h2>Google Calendar Integration</h2>
      {/* Show profile in navbar or here for demo */}
      {profile && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          {profile.picture && (
            <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
          )}
          <span>{profile.name}</span>
        </div>
      )}
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
