import React, { useState } from "react";
import Link from "next/link";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../firebaseConfig";
import { useAuth } from '../context/AuthContext';

const auth = getAuth(app);

const FirebaseNavbar = () => {
  const { profile, signIn, signOutUser } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const handleSignIn = async () => {
    await signIn();
    setToast("Signed in!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async () => {
    await signOutUser();
    setToast("Signed out!");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        <li><Link href="/geo">Geo</Link></li>
        <li><Link href="/calendar">Calendar</Link></li>
        <li><Link href="#chatbot">Chatbot</Link></li>
      </ul>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!profile ? (
          <div>
            <button onClick={handleSignIn}>Sign in with Google</button>
            <p style={{ fontSize: '0.9rem', color: '#888', marginTop: 8 }}>
              If you are not prompted for calendar access, <br />
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>revoke app access</a> and sign in again.
            </p>
          </div>
        ) : (
          <>
            {profile?.picture && (
              <img src={profile.picture} alt="Profile" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            )}
            <span>{profile?.name}</span>
            <button onClick={handleSignOut} style={{ marginLeft: 8 }}>Sign Out</button>
          </>
        )}
      </div>
      {toast && (
        <div style={{ position: "fixed", top: 10, right: 10, background: "#333", color: "#fff", padding: "8px 16px", borderRadius: "4px" }}>{toast}</div>
      )}
    </nav>
  );
};

export default FirebaseNavbar;
