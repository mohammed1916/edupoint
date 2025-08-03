import React, { useState } from 'react';
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

  const handleSignIn = async (idToken: string) => {
    setToken(idToken);
    try {
      const decoded: any = jwtDecode(idToken);
      setProfile({ name: decoded.name, picture: decoded.picture });
    } catch (e) {
      setProfile(null);
    }
    // Send idToken to backend
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile({ name: data.name, picture: data.picture });
    }
    // You need to exchange the ID token for an access token on your backend
    // For demo, just show signed-in state
    // fetchEvents(accessToken); // Uncomment when you have access token
  };

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/auth/profile`, {
      credentials: "include",
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data && data.name) setProfile({ name: data.name, picture: data.picture });
      });
  }, []);

  return (
    <div style={{marginTop: '2rem'}}>
      <h2>Calendar</h2>
      {/* Show profile in navbar or here for demo */}
      {/* {profile && (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          {profile.picture && (
            <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
          )}
          <span>{profile.name}</span>
        </div>
      )} */}
      {!token ? (
        <button onClick={() => alert('Use Firebase sign-in from navbar')}>Sign in with Google</button>
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
