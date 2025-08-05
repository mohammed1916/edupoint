import React, { useState } from "react";
import { useAuth } from '../context/AuthContext';

const GoogleCalendarFirebase = () => {
  const { accessToken, profile, signIn, signOutUser, loading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  const fetchEvents = async () => {
    if (!accessToken) return;
    const res = await fetch('/api/google/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken }),
    });
    const data = await res.json();
    setEvents(data.items || []);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Google Calendar (Firebase Auth)</h2>
      {!accessToken ? (
        <button onClick={signIn}>Sign in with Google</button>
      ) : (
        <div>
          {profile && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {profile.picture && (
                <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              )}
              <span>{profile.name}</span>
              <button onClick={signOutUser}>Sign Out</button>
            </div>
          )}
          <button onClick={fetchEvents} style={{ marginTop: "1rem" }}>
            Fetch Calendar Events
          </button>
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

export default GoogleCalendarFirebase;
