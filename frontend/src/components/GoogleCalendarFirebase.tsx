import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);

const GoogleCalendarFirebase = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [profile, setProfile] = useState<{ name?: string; picture?: string } | null>(null);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    setAccessToken(token || null);
    // Get profile info
    const user = result.user;
    setProfile({ name: user.displayName || "", picture: user.photoURL || "" });
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAccessToken(null);
    setProfile(null);
    setEvents([]);
  };

  const fetchEvents = async () => {
    if (!accessToken) return;
    const res = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await res.json();
    setEvents(data.items || []);
  };

  return (
    <div>
      <h2>Google Calendar (Firebase Auth)</h2>
      {!accessToken ? (
        <button onClick={handleSignIn}>Sign in with Google</button>
      ) : (
        <div>
          {profile && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              {profile.picture && (
                <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: "50%" }} />
              )}
              <span>{profile.name}</span>
              <button onClick={handleSignOut}>Sign Out</button>
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
