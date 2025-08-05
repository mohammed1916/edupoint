"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { app } from '../firebaseConfig';
import { sendIdTokenToBackend } from '../utils/authSession';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface AuthContextType {
  accessToken: string | null;
  profile: { name?: string; picture?: string } | null;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ name?: string; picture?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session/profile and accessToken on refresh
  useEffect(() => {
    console.log('[AuthProvider]');
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      setAccessToken(storedToken);
      console.log('[AuthProvider] Restored accessToken from localStorage:', storedToken);
    }
    fetch(`${API_BASE_URL}/auth/profile`, { credentials: 'include' })
      .then(res => {
        if (res.ok) return res.json();
        // If not authenticated, sign out at backend and clear profile
        console.log('[AuthProvider] Not authenticated, signing out at backend');
        fetch(`${API_BASE_URL}/auth/signout`, { method: 'POST', credentials: 'include' });
        setProfile(null);
        setAccessToken(null);
        localStorage.removeItem('accessToken');
        return null;
      })
      .then(data => {
        console.log('DATA:', data);
        if (data && data.name) setProfile({ name: data.name, picture: data.picture });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const signIn = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      setAccessToken(token || null);
      if (token) localStorage.setItem('accessToken', token);
      const user: User = result.user;
      // Send ID token to backend for session cookie
      const idToken = await user.getIdToken();
      const backendProfile = await sendIdTokenToBackend(idToken);
      if (backendProfile) {
        setProfile({ name: backendProfile.name, picture: backendProfile.picture });
      } else {
        setProfile({ name: user.displayName || '', picture: user.photoURL || '' });
      }
    } catch (error) {
      setProfile(null);
      setAccessToken(null);
      localStorage.removeItem('accessToken');
    }
  };

  const signOutUser = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setAccessToken(null);
    setProfile(null);
    localStorage.removeItem('accessToken');
    // Optionally call backend signout endpoint
    fetch(`${API_BASE_URL}/auth/signout`, { method: 'POST', credentials: 'include' }).then(() => {
      console.log('[AuthProvider] Signed out from backend');
    });
    setLoading(false);
    console.log('[AuthProvider] Signed out');
  };

  return (
    <AuthContext.Provider value={{ accessToken, profile, signIn, signOutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
