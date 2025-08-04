import React, { useState } from "react";
import Link from "next/link";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);

const FirebaseNavbar = ({ setAccessToken }: { setAccessToken: (token: string | null) => void }) => {
  const [profile, setProfile] = useState<{ name?: string; picture?: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/calendar.readonly");
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      setAccessToken(token || null);
      // Get profile info
      const user = result.user;
      setProfile({ name: user.displayName || "", picture: user.photoURL || "" });
      setToast("Signed in!");
      setTimeout(() => setToast(null), 3000);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setToast("Sign-in cancelled. Please try again and complete the sign-in.");
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast("Sign-in failed: " + (error.message || "Unknown error"));
        setTimeout(() => setToast(null), 4000);
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setAccessToken(null);
    setProfile(null);
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
