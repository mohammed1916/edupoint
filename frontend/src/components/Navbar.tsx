import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/navbar.module.css';
import GoogleSignIn from './GoogleSignIn';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const Navbar = () => {
  const [profile, setProfile] = useState<{ name?: string; picture?: string } | null>(null);

  // On mount, fetch profile from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/profile`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.name) setProfile({ name: data.name, picture: data.picture });
        else setProfile(null);
      });
  }, []);

  const handleSignIn = async (idToken: string) => {
    // Send idToken to backend
    const res = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ idToken }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile({ name: data.name, picture: data.picture });
    } else {
      setProfile(null);
    }
  };

  const handleSignOut = async () => {
    // Clear cookie by setting session to empty (implement /auth/signout on backend for real signout)
    document.cookie = 'session=; Max-Age=0; path=/;';
    setProfile(null);
  };

  return (
    <nav className={styles.navbar}>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/geo">Geo</Link></li>
        <li><Link href="/calendar">Calendar</Link></li>
        <li><Link href="#chatbot">Chatbot</Link></li>
      </ul>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!profile ? (
          <GoogleSignIn onSignIn={handleSignIn} />
        ) : (
          <>
            {profile.picture && (
              <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            )}
            <span>{profile.name}</span>
            <button onClick={handleSignOut} style={{ marginLeft: 8 }}>Sign Out</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
