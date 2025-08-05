"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './GoogleCalendar.module.css';

const GoogleCalendar: React.FC = () => {
  const { accessToken, profile, loading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (accessToken) {
      console.log('[GoogleCalendar] accessToken after refresh:', accessToken);
      fetch('/api/google/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      })
        .then(res => res.json())
        .then(data => setEvents(data.items || []));
    } else {
      console.log('[GoogleCalendar] No accessToken after refresh');
    }
  }, [accessToken]);

  if (loading) return <p>Loading...</p>;
  if (!accessToken) return <p>Please sign in with Google to view your calendar.</p>;

  return (
    <div className={styles.container}>
      <h2>Calendar</h2>
      {profile ? (
        <div className={styles.profile}>
          {profile.picture ? (
            <img src={profile.picture} alt="Profile" className={styles.profileImg} />
          ) : (
            <span>No profile picture</span>
          )}
          <span>{profile.name || 'No name available'}</span>
        </div>
      ) : (
        <div className={styles.profile}>
          <span>No profile info available</span>
        </div>
      )}
      <div>
        <ul>
          {events.length > 0 ? (
            events.map((event) => (
              <li key={event.id}>{event.summary}</li>
            ))
          ) : (
            <li>No events found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GoogleCalendar;
