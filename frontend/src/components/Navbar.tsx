import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/navbar.module.css';
import GoogleSignIn from './GoogleSignIn';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ name?: string; picture?: string } | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('google_id_token');
    if (storedToken) {
      setToken(storedToken);
      try {
        const decoded: any = jwtDecode(storedToken);
        setProfile({ name: decoded.name, picture: decoded.picture });
      } catch (e) {
        setProfile(null);
      }
    }
  }, []);

  // Add a custom event to sync sign-in state after sign-out/sign-in
  useEffect(() => {
    const syncSignIn = (e: any) => {
      if (e.key === 'google_id_token') {
        const newToken = localStorage.getItem('google_id_token');
        setToken(newToken);
        if (newToken) {
          try {
            const decoded: any = jwtDecode(newToken);
            setProfile({ name: decoded.name, picture: decoded.picture });
          } catch (e) {
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      }
    };
    window.addEventListener('storage', syncSignIn);
    return () => window.removeEventListener('storage', syncSignIn);
  }, []);

  const handleSignIn = (idToken: string) => {
    setToken(idToken);
    localStorage.setItem('google_id_token', idToken);
    try {
      const decoded: any = jwtDecode(idToken);
      setProfile({ name: decoded.name, picture: decoded.picture });
    } catch (e) {
      setProfile(null);
    }
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new StorageEvent('storage', { key: 'google_id_token' }));
  };

  const handleSignOut = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem('google_id_token');
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new StorageEvent('storage', { key: 'google_id_token' }));
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
        {!token ? (
          <GoogleSignIn onSignIn={handleSignIn} />
        ) : (
          <>
            {profile && profile.picture && (
              <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            )}
            <span>{profile?.name}</span>
            <button onClick={handleSignOut} style={{ marginLeft: 8 }}>Sign Out</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
